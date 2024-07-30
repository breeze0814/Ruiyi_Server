const body = require('../../util/body.js')
const { isEmpty, formatDate } = require('../../util/tools.js')
const { hashPassword } = require('../../util/crypto.js')
const { sys_user } = require('../../../resources/db/model')
const {
  searchUserList,
  checkUserInfo,
  insertUser,
  checkUserDataScope,
  selectRoleList,
  deleteUserByIds,
  insertUserRole,
  insertUserPost,
  checkUserAllowed,
  selectUserByVal,
  selectRolesByUserId,
  buildDeptTreeSelect,
  profileEdit,
  changePwd,
  profile,
} = require('../methods/userFunc')
const sequelize = require('../../../resources/db/mysql.js')
const { logger } = require('../../util/logger.js')

/**
 * 获取用户分页数据
 * @param {page, pageSize} ctx.request.query
 */
const GetUserList = async (ctx) => {
  try {
    const data = await searchUserList(ctx.request.query)
    ctx.body = {
      code: 200,
      msg: '查询成功',
      ...data,
    }
  } catch (err) {
    console.log(err.message, '-- GetUserList Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增用户
 * @param {user} ctx.request.body
 */
const Add = async (ctx) => {
  try {
    const user = ctx.request.body
    if (
      !(await checkUserInfo({
        user_name: user.userName,
      }))
    )
      throw new Error(`新增失败，${user.userName}已存在`)
    else if (
      !isEmpty(user.phonenumber) &&
      !(await checkUserInfo({
        phonenumber: user.phonenumber,
      }))
    )
      throw new Error(`新增失败，${user.userName}手机号已存在`)
    else if (
      !isEmpty(user.email) &&
      !(await checkUserInfo({
        email: user.email,
      }))
    )
      throw new Error(`新增失败，${user.userName}邮箱已存在`)

    user.create_by = ctx.loginUser.userName
    user.password = await hashPassword(user.password)
    const newUser = await insertUser(user)
    ctx.body = body.success(newUser)
  } catch (err) {
    console.log(err.message, '-- Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 *  根据userId查询用户
 * @param {userId} ctx.params
 */
const Search = async (ctx) => {
  try {
    const { userId } = ctx.params
    const final = {}
    await checkUserDataScope(userId)
    let roles = await selectRoleList()
    if (userId !== 1) {
      const roleList = []
      for (const role of roles) {
        if (role.roleId !== 1) roleList.push(role)
      }
      roles = roleList
    }
    final.roles = roles

    const posts = (
      await sequelize.query(
        `
            select
                post_id as postId, post_code as postCode, post_name as postName, post_sort as postSort,
                status, create_by as createBy, create_time as createTime, remark
            from sys_post
            `,
      )
    )[0]

    final.posts = posts

    if (!isEmpty(userId)) {
      const user = await selectUserByVal({
        userId,
      })
      final.data = user

      const postIds = (
        await sequelize.query(
          `
                select p.post_id as postId
                from sys_post p
                left join sys_user_post up on up.post_id = p.post_id
                left join sys_user u on u.user_id = up.user_id
                where u.user_id = ${userId}
                `,
        )
      )[0]

      final['postIds'] = []
      for (const item of postIds) {
        final['postIds'].push(item.postId)
      }

      final['roleIds'] = []
      for (const item of user.roles) {
        final['roleIds'].push(item.roleId)
      }
    }
    ctx.body = {
      code: 200,
      msg: '操作成功',
      ...final,
    }
  } catch (err) {
    console.log(err.message, '-- Search Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 批量删除用户
 * @param {userIds} ctx.params
 */
const Delete = async (ctx) => {
  try {
    let { userIds } = ctx.params

    userIds = userIds.split(',')

    const loginUserId = ctx.loginUser.userName
    if (userIds.includes(loginUserId)) {
      throw new Error('当前用户不能删除')
    }
    await deleteUserByIds(userIds)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Delete Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 更新用户信息
 * @param {user} ctx.request.body
 */
const Update = async (ctx) => {
  try {
    const user = ctx.request.body
    checkUserAllowed(user.userId)
    await checkUserDataScope(user.userId)

    if (
      !(await checkUserInfo({
        user_id: user.userId,
        nick_name: user.nickName,
      }))
    )
      throw new Error(`修改失败，${user.nickName}已存在`)
    else if (
      !isEmpty(user.phoneNumber) &&
      !(await checkUserInfo({
        user_id: user.userId,
        phonenumber: user.phonenumber,
      }))
    )
      throw new Error(`修改失败，${user.userName}手机号已存在`)
    else if (
      !isEmpty(user.email) &&
      !(await checkUserInfo({
        email: user.email,
      }))
    )
      throw new Error(`修改失败，${user.userName}邮箱已存在`)

    user.update_by = ctx.loginUser.userName
    // 更新权限信息
    await sequelize.query(`delete from sys_user_role where user_id = ${user.userId}`)
    await insertUserRole(user)

    // 更新部门信息
    await sequelize.query(`delete from sys_user_post where user_id = ${user.userId}`)
    await insertUserPost(user)

    const { userId, ...params } = user
    await sys_user.update(
      {
        ...params,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          user_id: userId,
        },
      },
    )

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Update Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改密码
 * @param {user} ctx.request.body
 */
const ResetPwd = async (ctx) => {
  try {
    const user = ctx.request.body
    checkUserAllowed(user.userId)
    await checkUserDataScope(user.userId)
    user.password = await hashPassword(user.password)
    user.update_by = ctx.loginUser.userName
    await sys_user.update(
      {
        ...user,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          user_id: user.userId,
        },
      },
    )
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- ResetPwd Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 根据用户编号获取授权角色
 * @param {userId} ctx.params
 */
const AuthRole = async (ctx) => {
  try {
    const { userId } = ctx.params
    const user = await selectUserByVal({
      userId,
    })
    let roles = await selectRolesByUserId(userId)
    if (isEmpty(userId) || userId !== 1) {
      roles = roles.filter((item) => {
        return item.roleId !== 1
      })
    }

    delete user.password

    ctx.body = {
      code: 200,
      msg: '查询成功',
      user,
      roles,
    }
  } catch (err) {
    console.log(err.message, '-- AuthRole Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增用户角色信息
 * @param {userId, roleIds} ctx.query
 */
const EditAuthRole = async (ctx) => {
  try {
    const { userId, roleIds } = ctx.query

    await checkUserDataScope(userId)

    await sequelize.query(`delete from sys_user_role where user_id = ${userId}`)

    const user = {
      userId,
      roleIds: roleIds.split(','),
    }
    await insertUserRole(user)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- EditAuthRole Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 状态修改
 * @param {user} ctx.request.body
 */
const ChangeStatus = async (ctx) => {
  try {
    const user = ctx.request.body
    checkUserAllowed(user)
    await checkUserDataScope(user.userId)

    user.update_by = ctx.loginUser.userName
    await sys_user.update(
      {
        ...user,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          user_id: user.userId,
        },
      },
    )

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- ChangeStatus Error')
    ctx.body = body.fail(err.message)
  }
}

const DeptTree = async (ctx) => {
  try {
    const { dept } = ctx.request.body
    const deptTree = await buildDeptTreeSelect(dept)

    ctx.body = body.success(deptTree)
  } catch (err) {
    console.log(err.message, '-- DeptTree Error')
    ctx.body = body.fail(err.message)
  }
}
/**
 * 个人信息
 * @param {*} ctx
 */
const PROFiLE = async (ctx) => {
  try {
    const user = ctx.loginUser
    const res = await profile(user)
    ctx.body = res
  } catch (error) {
    logger.error(error.message, '-- PROFiLE Error')
    ctx.body = body.fail(error.message)
  }
}
/**
 * 个人信息修改
 * @param {*} ctx
 */
const PROFiLE_EDIT = async (ctx) => {
  try {
    const user = ctx.request.body
    user.userId = ctx.loginUser.userId
    await profileEdit(user)
    ctx.body = {
      code: 200,
      msg: '修改成功',
    }
  } catch (err) {
    logger.error(err.message, '-- PROFiLE_EDIT Error')
    ctx.body = body.fail(err.message)
  }
}
/**
 * 修改密码
 */
const CHANGE_PWD = async (ctx) => {
  try {
    const { newPassword: new_pwd, oldPassword: old_pwd } = ctx.request.query
    const { userId } = ctx.loginUser
    await changePwd({
      new_pwd,
      old_pwd,
      user_id: userId,
    })
    ctx.body = {
      code: 200,
      msg: '修改成功',
    }
  } catch (err) {
    logger.error(err.message, '-- ChangePwd Error')
    ctx.body = body.fail(err.message)
  }
}
module.exports = {
  GetUserList,
  Add,
  Search,
  Delete,
  Update,
  ResetPwd,
  AuthRole,
  EditAuthRole,
  ChangeStatus,
  DeptTree,
  PROFiLE,
  PROFiLE_EDIT,
  CHANGE_PWD,
}
