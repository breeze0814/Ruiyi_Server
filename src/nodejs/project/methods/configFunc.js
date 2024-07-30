const { isEmpty, formatDate } = require('../../util/tools.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { adaptor } = require('../../util/adaptor.js')
const sequelize = require('../../../resources/db/mysql.js')
const { sys_config } = require('../../../resources/db/model')
const { set } = require('../../util/redis.js')
const { SYS_CONFIG_KEY } = require('../../configuration/CacheConstants.js')

const baseSql = `
    select
        config_id as configId, config_name as configName, config_key as configKey, config_value as configValue, config_type as configType,
        create_by as createBy, create_time as createTime, update_by as updateBy, update_time as updateTime, remark
    from sys_config
    where 1=1
    `

/**
 * 查询参数配置列表
 * @param {*} val 参数配置信息
 * @param {*} page
 * @param {*} pageSize
 * @returns 参数配置集合
 */
async function selectConfigList(val) {
  const {
    configName,
    configType,
    configKey,
    'params[beginTime]': beginTime,
    'params[endTime]': endTime,
  } = val
  let sql = baseSql
  if (!isEmpty(configName)) sql += `AND config_name like concat('%', '${configName}', '%')`
  if (!isEmpty(configType)) sql += `AND config_type = '${configType}' `
  if (!isEmpty(configKey)) sql += `AND config_key like concat('%', '${configKey}', '%') `
  if (!isEmpty(beginTime))
    sql += `and date_format(create_time,'%y%m%d') >= date_format('${beginTime}','%y%m%d') `
  if (!isEmpty(endTime))
    sql += `and date_format(create_time,'%y%m%d') <= date_format('${endTime}','%y%m%d') `
  const list = (await sequelize.query(sql))[0]
  return list
}

/**
 * 查询参数配置信息
 * @param {*} val
 * @returns 参数配置信息
 */
async function selectConfig(val) {
  const { configId, configKey } = val
  let sql = baseSql

  if (!isEmpty(configId)) sql += `and config_id = ${configId}`
  if (!isEmpty(configKey)) sql += `and config_key = ${configKey}`

  const config = (await sequelize.query(sql))[0][0]
  return config
}

/**
 * 校验参数键名是否唯一
 * @param {*} config 参数配置信息
 * @returns 结果
 */
async function checkConfigKeyUnique(config) {
  const configId = isEmpty(config.configId) ? -1 : config.configId
  const info = (
    await sequelize.query(baseSql + ` and config_key = '${config.configKey}' limit 1`)
  )[0][0]
  if (!isEmpty(info) && info.configId !== configId) {
    return UserConstants.NOT_UNIQUE
  }
  return UserConstants.UNIQUE
}

/**
 * 修改参数配置
 * @param {*} config 参数配置信息
 * @returns 结果
 */
async function updateConfig(config) {
  config = adaptor(config)
  const temp = await sys_config.findOne({
    where: {
      config_id: config.config_id,
    },
    raw: true,
  })
  if (temp.config_key === config.configKey) {
    // 删除redis缓存
  }

  const row = (
    await sys_config.update(
      {
        ...config,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          config_id: config.config_id,
        },
      },
    )
  )[0]

  if (row > 0) {
    // 新增redis缓存
  }
  return row
}

/**
 * cacheConfig
 */
async function cacheConfig() {
  const config = await sys_config.findAll({
    raw: true,
  })
  const configMap = new Map()
  for (const item of config) {
    configMap.set(item.config_key, item.config_value)
    set(SYS_CONFIG_KEY + item.config_key, item.config_value)
  }
  global.CONFIG_MAP = configMap
}
module.exports = {
  selectConfigList,
  selectConfig,
  checkConfigKeyUnique,
  updateConfig,
  cacheConfig,
}
