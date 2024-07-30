const { adaptor } = require('../../util/adaptor')
const { logger } = require('../../util/logger')
const { cacheDiceData } = require('../methods/dictDataFunc')
const { DictTypelist, Edit, Optionselect, Type, Delete, Add } = require('../methods/dictTypeFunc')

/**
 * 字典新增
 * @param {*} ctx
 */
const Add_DICT_TYPE = async (ctx) => {
  try {
    const info = adaptor(ctx.request.body)
    await Add(info, ctx.loginUser)
    await cacheDiceData()
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    logger.error(error, '-- ADD_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典编辑
 * @param {*} ctx
 */
const Edit_DICT_TYPE = async (ctx) => {
  try {
    const info_ = adaptor(ctx.request.body)
    await Edit(info_, ctx.loginUser)
    await cacheDiceData()
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    logger.error(error, '-- Edit_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典删除
 * @param {*} ctx
 */
const Delete_DICT_TYPE = async (ctx) => {
  try {
    const ids = ctx.params.ids.split(',')
    await Delete(ids)
    await cacheDiceData()
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    logger.error(error, '-- Delete_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典列表获取
 * @param {*} ctx
 */
const List_DICT_TYPE = async (ctx) => {
  try {
    const info = ctx.request.query
    const result = await DictTypelist(info)
    ctx.body = {
      code: 200,
      msg: '操作成功',
      ...result,
    }
  } catch (error) {
    logger.error(error, '-- List_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典下拉
 * @param {*} ctx
 */
const Optionselect_DICT_TYPE = async (ctx) => {
  try {
    const result = await Optionselect()
    ctx.body = {
      code: 200,
      msg: '操作成功',
      data: result,
    }
  } catch (error) {
    logger.error(error, '-- Optionselect_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典新增
 * @param {*} ctx
 */
const Type_DICT_TYPE = async (ctx) => {
  try {
    const id = ctx.params.id
    const result = await Type(id)
    ctx.body = {
      code: 200,
      msg: '操作成功',
      data: result,
    }
  } catch (error) {
    logger.error(error, '-- Type_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
/**
 * 字典刷新缓存
 * @param {*} ctx
 */
const Refresh_DICT_TYPE = async (ctx) => {
  try {
    await cacheDiceData()
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    logger.error(error, '-- Refresh_DICT_TYPE Error')
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
module.exports = {
  Add_DICT_TYPE,
  Edit_DICT_TYPE,
  Delete_DICT_TYPE,
  List_DICT_TYPE,
  Optionselect_DICT_TYPE,
  Type_DICT_TYPE,
  Refresh_DICT_TYPE,
}
