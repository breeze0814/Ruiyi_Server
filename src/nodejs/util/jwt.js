const jwt = require('jsonwebtoken')
const { isEmpty } = require('./tools.js')
const { getUserPermissions } = require('../project/servers/getUserInfo.js')
const sequelize = require('../../resources/db/mysql.js')
const { logger } = require('./logger.js')

const secret = 'Fat_Bones'

const whiteList = ['/login', '/captchaImage']

/**
 * 生成 token
 * @param {*} payload
 * @returns
 */
function buildToken(payload, expiresIn) {
  return jwt.sign(payload, secret, {
    // 秒为单位
    expiresIn,
  })
}

/**
 * 校验 token
 */
async function checkToken(ctx, next) {
  if (!whiteList.includes(ctx.url)) {
    const authorization = ctx.headers.authorization || ''
    let token = authorization.replace('Bearer ', '')
    try {
      const info = jwt.verify(token, secret)
      if (isEmpty(info)) {
        throw new Error('请先进行登录')
      }
      const loginUser = await theUser(info.username)

      const perms = await getUserPermissions(loginUser)
      loginUser.permissions = Array.from(perms)
      loginUser.uuid = info.uuid

      if (isEmpty(loginUser)) {
        ctx.status = 500
        ctx.body = {
          msg: '未找到用户',
        }
        return
      } else {
        ctx.loginUser = loginUser
      }
      await next()
    } catch (error) {
      ctx.body = {
        code: 401,
        error: '无效的token',
      }
      logger.error(error.message, '校验token失败')
    }
  } else {
    await next()
  }
}

async function theUser(username) {
  const loginUser = (
    await sequelize.query(
      `
        select
            user_id as userId, dept_id as deptId, user_name as userName, nick_name as nickName,
            user_type as userType, email, phonenumber, sex, avatar, status, del_flag as delFlag,
            login_ip as loginIp, login_date as loginDate, create_by as createBy,
            create_time as createTime, update_by as updateBy, update_time as updateTime, remark
        from
            sys_user su
        where
            user_name = '${username}'
        `,
    )
  )[0][0]

  if (!isEmpty(loginUser.deptId)) {
    const dept = (
      await sequelize.query(
        `
            select
                dept_id as deptId,parent_id as parentId,ancestors ,
                dept_name as deptName,order_num as orderNum,leader,
                phone,email ,status ,del_flag as delFlag,
                create_by as createBy,create_time as createTime,
                update_by as updateBy,update_time as updateTime
            from
                sys_dept sd
            where
                dept_id = ${loginUser.deptId}
            `,
      )
    )[0]
    const arr = await deepDep(dept[0], [])
    loginUser.dept = [dept[0], ...arr]
  }

  if (!isEmpty(loginUser.userId)) {
    const roles = (
      await sequelize.query(
        `
            select
                sr.role_id as roleId, role_name as roleName, role_key as roleKey, role_sort as roleSort, data_scope as dataScope,
                menu_check_strictly as menuCheckStrictly,dept_check_strictly as deptCheckStrictly, status, del_flag as delFlag,
                create_by as createBy, create_time as createTime, update_by as updateBy, update_time as updateTime, remark,
                false as flag, case when sr.role_id = 1 then true else false end as admin
            from
                sys_role sr
            left join sys_user_role sur on
                sr.role_id = sur.role_id
            where
                sur.user_id = ${loginUser.userId}
            `,
      )
    )[0]
    loginUser.roles = roles
  }
  return loginUser
}

const deepDep = async (dep, arr) => {
  if (!isEmpty(dep.parentId)) {
    const parent = (
      await sequelize.query(
        `
        select
            dept_id as deptId,parent_id as parentId,
            dept_name as deptName
        from
            sys_dept sd
        where
            dept_id = ${dep.parentId}
        `,
      )
    )[0]
    if (!isEmpty(parent[0])) {
      arr.push(parent[0])
      await deepDep(parent[0], arr)
    }
    return arr
  }
}
module.exports = {
  buildToken,
  checkToken,
}
