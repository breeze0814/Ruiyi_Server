const { sys_post } = require('../../../resources/db/model')
const { reverseAdaptor, adaptor } = require('../../util/adaptor.js')
const { formatDate } = require('../../util/tools.js')
const { Op } = require('sequelize')
const PostList = async (ctx) => {
  const { pageSize, pageNum, postCode, postName, status } = ctx.request.query
  const where = {}
  if (postCode)
    Object.assign(where, {
      post_code: {
        [Op.like]: `%${postCode}%`,
      },
    })
  if (postName)
    Object.assign(where, {
      post_name: {
        [Op.like]: `%${postName}%`,
      },
    })
  if (status)
    Object.assign(where, {
      status,
    })
  const total = await sys_post.count({})
  const result = await sys_post.findAll({
    where,
    offset: (pageNum - 1) * pageSize,
    limit: +pageSize,
    raw: true,
  })
  const result_ = []
  result.map((item) => {
    const a = {}
    for (const key in item) {
      a[reverseAdaptor(key)] = item[key]
    }
    result_.push(a)
  })
  ctx.body = {
    code: 200,
    msg: '查询成功',
    rows: result_,
    total,
  }
}
const PostType = async (ctx) => {
  const id = ctx.params.id
  const data = await sys_post.findOne({
    where: {
      post_id: id,
    },
    raw: true,
  })
  const a = {}
  for (const key in data) {
    a[reverseAdaptor(key)] = data[key]
  }
  ctx.body = {
    code: 200,
    msg: '查询成功',
    data: a,
  }
}
const PostEdit = async (ctx) => {
  try {
    const info_ = adaptor(ctx.request.body)
    await checkRepeat(info_)
    const update_by = ctx.loginUser.userName
    const update_time = formatDate(new Date())
    Object.assign(info_, {
      update_by,
      update_time,
    })
    await sys_post.upsert(info_)
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
const PostAdd = async (ctx) => {
  try {
    const info = adaptor(ctx.request.body)
    await checkRepeat(info)
    const create_by = ctx.loginUser.userName
    const create_time = formatDate(new Date())
    Object.assign(info, {
      create_by,
      create_time,
    })
    await sys_post.upsert(info)
    ctx.body = {
      code: 200,
      msg: '操作成功',
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: error.message,
    }
  }
}
const PostDelete = async (ctx) => {
  const ids = ctx.params.ids.split(',')
  await sys_post.destroy({
    where: {
      post_id: ids,
    },
  })
  ctx.body = {
    code: 200,
    msg: '操作成功',
  }
}

const checkRepeat = async (info) => {
  const { post_code, post_name } = info
  const postId = info.post_id || -1
  const a = await sys_post.findAll({
    where: {
      post_code,
    },
    raw: true,
  })
  if (a[0] && a[0].post_id !== postId) throw new Error(`修改失败，岗位编码 [${post_code}] 已存在`)
  const b = await sys_post.findAll({
    where: {
      post_name,
    },
    raw: true,
  })
  if (b[0] && b[0].post_id !== postId) throw new Error(`修改失败，岗位名称 [${post_name}] 已存在`)
}
module.exports = {
  PostList,
  PostType,
  PostEdit,
  PostAdd,
  PostDelete,
}
