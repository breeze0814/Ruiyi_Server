const body = require('../../util/body.js')
const { pageData, formatDate } = require('../../util/tools.js')
const {
  selectDictDataList,
  selectDictDataById,
  selectDictDataByType,
  insertDictData,
  updateDictData,
  deleteDictDataByIds,
} = require('../methods/dictDataFunc.js')

/**
 * 获取字典列表
 * @param {dictData} ctx.request.query
 */
const List = async (ctx) => {
  try {
    const dictData = ctx.request.query
    const list = await selectDictDataList(dictData)
    ctx.body = {
      code: 200,
      msg: '查询成功',
      ...pageData(list),
    }
  } catch (err) {
    console.log(err.message, '-- List Error')
    ctx.body = body.fail(err.message)
  }
}

const Export = async (ctx) => {
  try {
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Export Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 查询字典数据详细
 * @param {dictCode} ctx.params
 */
const GetInfo = async (ctx) => {
  try {
    const { dictCode } = ctx.params
    const data = await selectDictDataById(dictCode)
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- GetInfo Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 根据字典类型查询字典数据信息
 * @param {dictType} ctx.params
 */
const DictType = async (ctx) => {
  try {
    const { dictType } = ctx.params
    const data = await selectDictDataByType(dictType)
    ctx.body = body.success(data || [])
  } catch (err) {
    console.log(err.message, '-- DictType Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增字典类型
 * @param {dict} ctx.request.body
 */
const Add = async (ctx) => {
  try {
    const dict = ctx.request.body
    dict.create_by = ctx.loginUser.userName
    dict.create_time = formatDate(new Date())
    await insertDictData(dict)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改字典数据
 * @param {dict} ctx.request.body
 */
const Edit = async (ctx) => {
  try {
    const dict = ctx.request.body
    dict.update_by = ctx.loginUser.userName
    dict.update_time = formatDate(new Date())
    const row = await updateDictData(dict)
    ctx.body = body.success(row)
  } catch (err) {
    console.log(err.message, '-- Edit Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 删除字典信息
 * @param {dictCodes} ctx.params
 */
const Remove = async (ctx) => {
  try {
    const { dictCodes } = ctx.params
    await deleteDictDataByIds(dictCodes)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Remove Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  List,
  Export,
  GetInfo,
  DictType,
  Add,
  Edit,
  Remove,
}
