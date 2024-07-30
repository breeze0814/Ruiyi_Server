const { sys_dict_type } = require('../../../resources/db/model')
const { SYS_DICT_KEY } = require('../../configuration/CacheConstants.js')
const { adaptor } = require('../../util/adaptor.js')
const { del } = require('../../util/redis.js')
const { formatDate } = require('../../util/tools.js')
const { Op } = require('sequelize')
async function DictTypelist(info) {
  const {
    pageSize,
    pageNum,
    dictName,
    dictType,
    status,
    'params[beginTime]': beginTime,
    'params[endTime]': endTime,
  } = info
  const where = {}
  if (dictName)
    Object.assign(where, {
      dict_name: {
        [Op.like]: `%${dictName}%`,
      },
    })
  if (dictType)
    Object.assign(where, {
      dict_type: dictType,
    })
  if (status)
    Object.assign(where, {
      status,
    })
  if (beginTime && endTime)
    Object.assign(where, {
      create_time: {
        [Op.between]: [beginTime, endTime],
      },
    })
  const result = await sys_dict_type.findAll({
    attributes: [
      ['dict_id', 'dictId'],
      ['dict_name', 'dictName'],
      ['dict_type', 'dictType'],
      ['create_by', 'createBy'],
      ['create_time', 'createTime'],
      ['remark', 'remark'],
      ['status', 'status'],
    ],
    where,
    offset: (pageNum - 1) * pageSize,
    limit: +pageSize,
    raw: true,
  })
  const total = await sys_dict_type.count({
    where,
  })
  return {
    rows: result,
    total,
  }
}
const Optionselect = async () => {
  const result = await sys_dict_type.findAll({
    attributes: [
      ['dict_id', 'dictId'],
      ['dict_name', 'dictName'],
      ['dict_type', 'dictType'],
      ['create_by', 'createBy'],
      ['create_time', 'createTime'],
      ['remark', 'remark'],
      ['status', 'status'],
    ],
    raw: true,
  })
  return result
}
async function Type(id) {
  const result = await sys_dict_type.findOne({
    attributes: [
      ['dict_id', 'dictId'],
      ['dict_name', 'dictName'],
      ['dict_type', 'dictType'],
      ['create_by', 'createBy'],
      ['create_time', 'createTime'],
      ['remark', 'remark'],
      ['status', 'status'],
    ],
    where: {
      dict_id: id,
    },
    raw: true,
  })
  return result
}
async function Edit(info, user) {
  const info_ = adaptor(info)
  await checkRepeat(info_)
  const update_by = user.userName
  const update_time = formatDate(new Date())
  Object.assign(info_, {
    update_by,
    update_time,
  })
  await sys_dict_type.upsert(info_)
}
async function Add(obj, user) {
  const info = adaptor(obj)
  await checkRepeat(info)
  const create_by = user.userName
  const create_time = formatDate(new Date())
  Object.assign(info, {
    create_by,
    create_time,
  })
  await sys_dict_type.upsert(info)
}
async function Delete(ids) {
  const curr = await sys_dict_type.findAll({
    where: {
      dict_id: ids,
    },
    raw: true,
  })
  const { dict_type: name } = curr[0]
  await sys_dict_type.destroy({
    where: {
      dict_id: ids,
    },
  })
  await del(SYS_DICT_KEY + name)
}

const checkRepeat = async (info) => {
  const { dict_name, dict_type } = info
  const postId = info.dict_id || -1
  const a = await sys_dict_type.findAll({
    where: {
      dict_name,
    },
    raw: true,
  })
  if (a[0] && a[0].dict_id !== postId) throw new Error(`修改失败，字典编码 [${dict_name}] 已存在`)
  const b = await sys_dict_type.findAll({
    where: {
      dict_type,
    },
    raw: true,
  })
  if (b[0] && b[0].dict_id !== postId) throw new Error(`修改失败，字典名称 [${dict_type}] 已存在`)
}
module.exports = {
  DictTypelist,
  Optionselect,
  Type,
  Edit,
  Add,
  Delete,
}
