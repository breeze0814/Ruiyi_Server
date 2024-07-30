const body = require('../../util/body.js')
const { isEmpty, formatDate } = require('../../util/tools.js')
const { isMatchedIp, ip, getLoginLocal, isPrivateIP } = require('../../util/ip.js')
const { buildToken } = require('../../util/jwt.js')
const crypto = require('crypto')
const redis = require('../../util/redis.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { logger } = require('../../util/logger.js')
const { comparePassword } = require('../../util/crypto.js')
const { sys_config, sys_user, sys_logininfor } = require('../../../resources/db/model')
const { TOKEN_KEY } = require('../../configuration/CacheConstants.js')

const login_location = isPrivateIP(ip) ? '内网IP' : getLoginLocal(ip)

/**
 * 登录获取 token
 * @param {username, password} ctx.request.body
 */
const Login = async (ctx) => {
  try {
    const { username, password, code, uuid } = ctx.request.body
    const browser = ctx.userAgent.browser
    const os = ctx.userAgent.os
    console.log(!code)
    console.log(code?.toUpperCase() !== ctx.session.captcha.toUpperCase())
    console.log(!code || code?.toUpperCase() !== ctx.session.captcha.toUpperCase())
    if (!code || code?.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      ctx.body = body.fail('验证码错误')
      return
    }
    await loginPreCheck(username, password, '', browser, os)
    const token = await createToken(username, browser, os, uuid)
    ctx.body = {
      code: 200,
      token,
      msg: '登陆成功',
    }
  } catch (err) {
    console.log(err.message, '-- Login Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 退出登录
 * @param {*} ctx
 */
const Logout = async (ctx) => {
  try {
    const os = ctx.userAgent.os
    const loginUser = ctx.loginUser
    if (!isEmpty(loginUser)) {
      const userName = loginUser.userName
      // 删除用户缓存记录
      redis.del(loginUser.uuid)
      // 记录用户退出日志
      await recordLogininfor(userName, 'Logout', '退出成功', os, ctx.userAgent.browser)
    }

    ctx.body = body.success()
  } catch (err) {
    console.log(err, '-- Logout Error')
    ctx.body = body.fail(err)
  }
}

/**
 * 登录信息校验
 * @param {*} username
 * @param {*} password
 * @param {*} msg
 */
async function loginPreCheck(username, password, msg, browser, os) {
  if (isEmpty(username) || isEmpty(password)) {
    msg = '用户不存在/密码错误'
    await keepLoginInfo(username, 1, msg, browser, os)
    throw new Error(msg)
  }
  if (
    password.length > UserConstants.PASSWORD_MAX_LENGTH ||
    password.length < UserConstants.PASSWORD_MIN_LENGTH
  ) {
    msg = '密码长度错误'
    await keepLoginInfo(username, 1, msg, browser, os)
    throw new Error(msg)
  }

  if (
    username > UserConstants.USERNAME_MAX_LENGTH ||
    username < UserConstants.USERNAME_MIN_LENGTH
  ) {
    msg = '用户长度错误'
    await keepLoginInfo(username, 1, msg, browser, os)
    throw new Error(msg)
  }

  let ips = await sys_config.findOne({
    attributes: ['config_value'],
    where: {
      config_key: 'sys.login.blackIPList',
    },
    raw: true,
  })

  if (isMatchedIp(ip, ips.config_value)) {
    msg = '很遗憾，访问IP已被列入系统黑名单'
    await keepLoginInfo(username, 1, msg, browser, os)
    throw new Error(msg)
  }

  let failCount = (await redis.get(getCacheKey(username))) || 0

  if (failCount >= UserConstants.MAX_FAIL_COUNT) throw new Error('账户已被锁定')
  const user = await sys_user.findOne({
    where: {
      user_name: username,
    },
    raw: true,
  })
  if (!user) throw new Error('未找到用户')
  // 比较登录密码和数据库密码
  if (!(await comparePassword(password, user.password))) {
    failCount++
    await redis.set(getCacheKey(username), failCount)
    throw new Error('密码错误,当前可输入次数:' + failCount)
  }
  if (await redis.hasKey(getCacheKey(username))) await redis.del(getCacheKey(username))
}

function getCacheKey(username) {
  return 'pwd_err_cnt:' + username
}

async function createToken(username, browser, os, uuid) {
  const loginUser = await sys_user.findOne({
    where: {
      user_name: username,
    },
    raw: true,
  })
  const expiresIn = 60 * 1000
  loginUser.uuid = uuid
  await refreshToken(loginUser, expiresIn)

  await sys_user.update(
    {
      login_ip: ip,
      login_date: formatDate(new Date()),
    },
    {
      where: {
        user_name: username,
      },
    },
  )

  await keepLoginInfo(username, 0, '登陆成功', browser, os)

  return buildToken(
    {
      uuid,
      username,
      salt: crypto.randomBytes(128).toString('hex'),
    },
    expiresIn,
  )
}

/**
 * 保存登录信息
 * @param {*} username
 * @param {*} status 0 - 成功  1 - 失败
 * @param {*} msg
 * @param {*} browser
 */
async function keepLoginInfo(username, status, msg, browser, os) {
  const system_os = os || 'unknown os'

  await sys_logininfor.create({
    user_name: username,
    ipaddr: ip,
    os: system_os,
    login_location,
    browser,
    status,
    msg,
    login_time: formatDate(new Date()),
  })
}

/**
 * 刷新缓存
 * @param {*} loginUser
 * @param {*} expiresIn
 */
async function refreshToken(loginUser, expiresIn) {
  loginUser.loginTime = formatDate(new Date())
  await redis.set(TOKEN_KEY + loginUser.uuid, loginUser)
  redis.expire(TOKEN_KEY + loginUser.uuid, expiresIn)
}

async function recordLogininfor(username, status, message, os, ...args) {
  let log = `【${ip}】 【${login_location}】 【${username}】 【${message}】`
  logger.info(log)

  const statusArr = ['Success', 'Logout', 'Register']
  if (statusArr.includes(status)) status = '0'
  else if ('Error' === status) status = '1'

  await keepLoginInfo(username, status, message, args[0])
}

module.exports = {
  Login,
  refreshToken,
  Logout,
}
