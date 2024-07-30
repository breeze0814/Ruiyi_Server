const { isEmpty, deepClone } = require('../../util/tools.js')
const sequelize = require('../../../resources/db/mysql.js')
const redis = require('../../util/redis.js')
const { adaptor, reverseAdaptor } = require('../../util/adaptor.js')
const { sys_dict_data, sys_dict_type } = require('../../../resources/db/model')
const { QueryTypes } = require('sequelize')
const CacheConstants = require('../../configuration/CacheConstants.js')

const baseSql = `
    select
        dict_code as dictCode,
        dict_sort as dictSort,
        dict_label as dictLabel,
        dict_value as dictValue,
        dict_type as dictType,
        css_class as cssClass,
        list_class as listClass,
        is_default as isDefault,
        status,
        create_by as createBy,
        create_time as createTime,
        remark
	from sys_dict_data
    `

async function selectDictDataList(dictData) {
  const { dictType, dictLabel, status } = dictData
  let sql = deepClone(baseSql) + ` where 1=1 `

  if (!isEmpty(dictType)) {
    sql += ` AND dict_type = '${dictType}' `
  }

  if (!isEmpty(dictLabel)) {
    sql += ` AND dict_label = '${dictLabel}' `
  }

  if (!isEmpty(status)) {
    sql += `AND status = '${status}' `
  }

  sql += ` order by dict_sort asc`
  const list = (await sequelize.query(sql))[0]
  return list
}

async function selectDictDataById(dictCode) {
  let sql = deepClone(baseSql) + ` where dict_code = ${dictCode}`
  const info = (await sequelize.query(sql))[0][0]
  return info
}

async function selectDictDataByType(dictType) {
  let dictDatas = await getDictData(dictType)
  if (!isEmpty(dictDatas)) return dictDatas

  const sql =
    deepClone(baseSql) + ` where status = '0' and dict_type = '${dictType}' order by dict_sort asc`

  dictDatas = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  })

  if (!isEmpty(dictDatas)) {
    await redis.set(`${CacheConstants.SYS_DICT_KEY}${dictType}`, dictDatas)
    return dictDatas
  }
  return null
}

async function getDictData(key) {
  const arrayCache = await redis.get(`${CacheConstants.SYS_DICT_KEY}+${key}`)
  if (!isEmpty(arrayCache)) return arrayCache
  return null
}

async function insertDictData(data) {
  data = adaptor(data)
  const info = (
    await sys_dict_data.create({
      ...data,
    })
  ).dataValues

  if (!isEmpty(info)) {
    const newOne = await sys_dict_data.findAll({
      where: {
        dict_type: info.dict_type,
      },
      raw: true,
    })
    newOne.map((item) => {
      for (let key in item) {
        const newkey = underscoreToCamelCase(key)
        item[newkey] = item[key]
        delete item[key]
      }
    })
    redis.set(`${CacheConstants.SYS_DICT_KEY}${info.dict_type}`, newOne)
  }
}
function underscoreToCamelCase(str) {
  return str.replace(/_([a-z])/g, function (match) {
    return match[1].toUpperCase()
  })
}
async function updateDictData(data) {
  data = adaptor(data)
  const row = await sys_dict_data.update(
    {
      ...data,
    },
    {
      where: {
        dict_code: data.dict_code,
      },
    },
  )
  if (row[0] > 0) {
    const newOne = await selectDictDataByType(data.dict_type)
    redis.set(`${CacheConstants.SYS_DICT_KEY}${data.dict_type}`, newOne)
  }
  return row
}

async function deleteDictDataByIds(dictCodes) {
  for (const dictCode of dictCodes.split(',')) {
    if (isEmpty(dictCode)) continue
    const data = await sys_dict_data.findOne({
      where: {
        dict_code: dictCode,
      },
      raw: true,
    })
    await sequelize.query(`delete from sys_dict_data where dict_code = '${dictCode}'`)
    let sql =
      deepClone(baseSql) +
      ` where status = '0' and dict_type = '${data.dict_type}' order by dict_sort asc`
    const dictDatas = (await sequelize.query(sql))[0]
    redis.set(data.dict_type, dictDatas)
  }
}
async function cacheDiceData() {
  const dictType = await sys_dict_type.findAll({
    where: {
      status: 0,
    },
    raw: true,
  })
  const dictMap = new Map()
  for (const item of dictType) {
    if (!dictMap.has(item.dict_type)) {
      dictMap.set(item.dict_type, [])
    }
  }
  const dictDatas = await sys_dict_data.findAll({
    where: {
      status: 0,
    },
    raw: true,
  })
  for (const item of dictDatas) {
    const data = {}
    for (let k in item) {
      data[reverseAdaptor(k)] = item[k]
    }
    if (!dictMap.has(item.dict_type)) {
      dictMap.set(item.dict_type, [])
    }
    dictMap.get(item.dict_type).push(data)
  }
  global.DICTMAP = dictMap
  for (const [key, value] of dictMap) {
    redis.set(`${CacheConstants.SYS_DICT_KEY}${key}`, value)
  }
}
module.exports = {
  selectDictDataList,
  selectDictDataById,
  selectDictDataByType,
  insertDictData,
  updateDictData,
  deleteDictDataByIds,
  cacheDiceData,
}
