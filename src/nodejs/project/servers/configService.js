const body = require('../../util/body')
const {
  selectConfigList,
  selectConfig,
  checkConfigKeyUnique,
  updateConfig,
  cacheConfig,
} = require('../methods/configFunc')
const { pageData, formatDate } = require('../../util/tools')
const { adaptor } = require('../../util/adaptor')
const UserConstants = require('../../configuration/UserConstants')
const { sys_config } = require('../../../resources/db/model')
const sequelize = require('../../../resources/db/mysql')
const { del } = require('../../util/redis')
const { SYS_CONFIG_KEY } = require('../../configuration/CacheConstants')

/**
 * 获取参数配置列表
 * @param {page, pageSize, ...config} ctx.request.query
 */
const List = async (ctx) => {
  try {
    const { pageNum, pageSize, ...config } = ctx.request.query
    const list = await selectConfigList(config)
    ctx.body = {
      code: 200,
      msg: '操作成功',
      ...pageData(list, pageNum, pageSize),
    }
  } catch (err) {
    console.log(err.message, '-- List Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * ctx.params
 * @param {configId} ctx.params
 */
const Search = async (ctx) => {
  try {
    const { configId } = ctx.params
    const config = await selectConfig({
      configId,
    })
    ctx.body = body.success(config)
  } catch (err) {
    console.log(err.message, '-- Search Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增参数配置
 * @param {*} ctx.request.body
 */
const Add = async (ctx) => {
  try {
    let config = ctx.request.body
    if (!(await checkConfigKeyUnique(config)))
      throw new Error(`新增参数${config.configName}失败，参数键名已存在`)
    config = adaptor(config)
    config.create_by = ctx.loginUser.userName
    await sys_config.create({
      ...config,
      create_time: formatDate(new Date()),
    })
    await cacheConfig()
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改参数配置
 * @param {*} ctx.request.body
 */
const Update = async (ctx) => {
  try {
    let config = ctx.request.body
    if (!(await checkConfigKeyUnique(config)))
      throw new Error(`修改参数${config.configName}失败，参数键名已存在`)
    config.update_by = ctx.loginUser.userName
    await updateConfig(config)
    await cacheConfig()
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Update Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 删除参数配置
 * @param {configIds} ctx.params
 */
const Delete = async (ctx) => {
  try {
    const { configIds } = ctx.params
    for (const id of configIds.split(',')) {
      const config = await sys_config.findOne({
        where: {
          config_id: id,
        },
        raw: true,
      })
      if (config.config_type === UserConstants.YES)
        throw new Error(`内置参数【${config.config_key}】不能删除`)
      await sequelize.query(`delete from sys_config where config_id = ${id}`)
      // 删除redis缓存
      await del(SYS_CONFIG_KEY + config.config_key)
    }
    await cacheConfig()
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Delete Error')
    ctx.body = body.fail(err.message)
  }
}

const GetConfigKey = async (ctx) => {
  try {
    const { configKey } = ctx.params
    const config = await selectConfig({
      configKey,
    })
    ctx.body = body.success(config)
  } catch (err) {
    console.log(err.message, '-- GetConfigKey Error')
    ctx.body = body.fail(err.message)
  }
}

const RefreshCache = async (ctx) => {
  try {
    await cacheConfig()
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- RefreshCache Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  List,
  Search,
  Add,
  Update,
  Delete,
  GetConfigKey,
  RefreshCache,
}
