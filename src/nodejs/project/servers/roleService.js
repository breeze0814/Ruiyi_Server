const body = require('../../util/body.js')
const {
  searchRoleList,
  checkRoleAllowed,
  checkRoleDataScope,
  checkRoleInfo,
  insertRoleMenu,
  authDataScope,
  checkRoleNameUnique,
  checkRoleKeyUnique,
} = require('../methods/roleFunc.js')
const { formatDate, pageData } = require('../../util/tools.js')
const { adaptor } = require('../../util/adaptor.js')
const { getUserPermissions } = require('./getUserInfo.js')
const { refreshToken } = require('./loginService.js')
const crypto = require('crypto')
const { buildDeptTreeSelect, selectRoleList } = require('../methods/userFunc.js')
const { selectAllocatedList, selectUnAllocatedList } = require('../methods/routerFunc.js')
const { sys_role, sys_user } = require('../../../resources/db/model')
const sequelize = require('../../../resources/db/mysql.js')

/**
 * 获取角色列表
 * @param {page, pageSize} ctx.request.query
 */
const GetRoleList = async (ctx) => {
  try {
    const role = ctx.request.query
    const data = await searchRoleList(role)
    ctx.body = {
      code: 200,
      msg: '查询成功',
      ...pageData(data, role.pageNum, role.pageSize),
    }
  } catch (err) {
    console.log(err.message, '-- GetRoleList Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 状态修改
 * @param {role} ctx.request.body
 */
const ChangeStatus = async (ctx) => {
  try {
    const role = ctx.request.body
    checkRoleAllowed(role.roleId)
    await checkRoleDataScope(role.roleId)
    role.update_by = ctx.loginUser.userName
    await sys_role.update(
      {
        ...role,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          role_id: role.roleId,
        },
      },
    )

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- ChangeStatus Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 获取角色信息
 * @param {roleId} ctx.params
 */
const Search = async (ctx) => {
  try {
    const { roleId } = ctx.params
    await checkRoleDataScope(roleId)
    const role = (
      await searchRoleList({
        roleId,
      })
    )[0]
    ctx.body = body.success(role)
  } catch (err) {
    console.log(err.message, '-- Search Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增角色信息
 * @param {*} ctx
 */
const Add = async (ctx) => {
  try {
    let role = ctx.request.body
    if (
      !(await checkRoleInfo({
        roleName: role.roleName,
      }))
    )
      throw new Error(`新增失败，角色名称 [${role.roleName}] 已存在`)
    else if (
      !(await checkRoleInfo({
        roleKey: role.roleKey,
      }))
    )
      throw new Error(`新增失败，角色权限 [${role.roleKey}] 已存在`)

    role = adaptor(role)

    role.create_by = ctx.loginUser.userName
    const one = (
      await sys_role.create({
        ...role,
        create_time: formatDate(new Date()),
      })
    ).dataValues

    role.role_id = one.role_id

    const rows = await insertRoleMenu(role)

    ctx.body = body.success(rows)
  } catch (err) {
    console.log(err.message, '-- Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 更新角色信息
 * @param {role} ctx.request.body
 */
const Update = async (ctx) => {
  try {
    let role = ctx.request.body
    checkRoleAllowed(role)
    await checkRoleDataScope(role.roleId)
    if (!(await checkRoleNameUnique(role)))
      throw new Error(`修改失败，角色名称 [${role.roleName}] 已存在`)
    else if (!(await checkRoleKeyUnique(role)))
      throw new Error(`修改失败，角色权限 [${role.roleKey}] 已存在`)
    role = adaptor(role)
    // 更新角色
    await sys_role.update(
      {
        ...role,
        update_time: formatDate(new Date()),
      },
      {
        where: {
          role_id: role.role_id,
        },
      },
    )
    // 更新角色菜单关联
    await sequelize.query(`delete from sys_role_menu where role_id= ${role.role_id}`)
    const rows = await insertRoleMenu(role)
    if (rows > 0) {
      const permissions = await getUserPermissions(ctx.loginUser)
      const user = await sys_user.findOne({
        where: {
          user_name: ctx.loginUser.userName,
        },
      })
      const loginUser = {
        user,
        permissions,
        uuid: crypto.randomUUID(),
      }

      refreshToken(loginUser, 60 * 60)
    }
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Update Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 删除角色
 * @param {roleIds} ctx.params
 */
const Delete = async (ctx) => {
  try {
    let { roleIds } = ctx.params
    roleIds = roleIds.split(',')
    let condition = `(`
    for (const roleId of roleIds) {
      checkRoleAllowed(roleId)
      await checkRoleDataScope(roleId)
      const count = (
        await sequelize.query(`select count(1) from sys_user_role where role_id = ${roleId}`)
      )[1]
      if (count > 0) throw new Error('权限已分配，无法删除')
      condition += roleId + `,`
    }

    condition = condition.replace(/,$/, '') + `)`

    // 删除角色与菜单关联
    await sequelize.query(`delete from sys_role_menu where role_id in ${condition}`)

    // 删除角色与部门关联
    await sequelize.query(`delete from sys_role_dept where role_id in ${condition}`)

    // 软删除角色
    await sequelize.query(`update sys_role set del_flag = '2' where role_id in ${condition}`)

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Delete Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 获取对应角色部门树列表
 * @param {roleId} ctx.params
 */
const DeptTree = async (ctx) => {
  try {
    const { roleId } = ctx.params

    const role = await sys_role.findOne({
      where: {
        role_id: roleId,
      },
      row: true,
    })
    let sql = `
        select d.dept_id
        from sys_dept d
            left join sys_role_dept rd on d.dept_id = rd.dept_id
        where rd.role_id = ${roleId}
        `
    if (role.dept_check_strictly)
      sql += ` and d.dept_id not in (
            select d.parent_id from sys_dept d
            inner join sys_role_dept rd
            on d.dept_id = rd.dept_id and rd.role_id = ${roleId}
            )`

    sql += `order by d.parent_id, d.order_num`

    const checkedKeys = []
    for (const item of (await sequelize.query(sql))[0]) {
      checkedKeys.push(item.dept_id)
    }

    const depts = await buildDeptTreeSelect()

    ctx.body = {
      code: 200,
      msg: '操作成功',
      checkedKeys,
      depts,
    }
  } catch (err) {
    console.log(err.message, '-- DeptTree Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 查询已分配用户角色列表
 * @param {page, pageSize} ctx.request.query
 */
const AllocatedList = async (ctx) => {
  try {
    const { page, pageSize, ...user } = ctx.request.query

    const final = await selectAllocatedList(user)

    ctx.body = {
      code: 200,
      msg: '操作成功',
      ...pageData(final, page, pageSize),
    }
  } catch (err) {
    console.log(err.message, '-- AllocatedList Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 查询未分配用户角色列表
 * @param {page, pageSize} ctx.request.query
 */
const UnAllocatedList = async (ctx) => {
  try {
    const { page, pageSize, ...user } = ctx.request.query
    const final = await selectUnAllocatedList(user)
    ctx.body = {
      code: 200,
      msg: '操作成功',
      ...pageData(final, page, pageSize),
    }
  } catch (err) {
    console.log(err.message, '-- AllocatedList Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 取消授权用户
 * @param {userId, roleId} ctx.request.body
 */
const CancelAuthUser = async (ctx) => {
  try {
    const { userId, roleId } = ctx.request.body
    await sequelize.query(`delete from sys_user_role where user_id=${userId} and role_id=${roleId}`)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Cancel Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 批量取消授权用户
 * @param {*} ctx.request.query
 */
const CancelAuthUserAll = async (ctx) => {
  try {
    const { userIds, roleId } = ctx.request.query

    let sql = `delete from sys_user_role where role_id=${roleId} and user_id in(`
    for (const item of userIds.split(',')) {
      sql += item + `,`
    }
    sql = sql.replace(/,$/, '') + `)`
    await sequelize.query(sql)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- CancelAuthUserAll Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 批量选择用户授权
 * @param {*} ctx.request.query
 */
const SelectAuthUserAll = async (ctx) => {
  try {
    const { roleId, userIds } = ctx.request.query
    await checkRoleDataScope(roleId)

    let sql = `insert into sys_user_role(user_id, role_id) values`

    for (const item of userIds.split(',')) {
      sql += `(${item}, ${roleId}),`
    }

    sql = sql.replace(/.$/, '') + ``
    await sequelize.query(sql)

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- SelectAuthUserAll Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 获取角色选择框列表
 * @param {*} ctx
 */
const Optionselect = async (ctx) => {
  try {
    const list = await selectRoleList()
    ctx.body = body.success(list)
  } catch (err) {
    console.log(err.message, '-- Optionselect Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改保存数据权限
 * @param {*} ctx.request.body
 */
const DataScope = async (ctx) => {
  try {
    const role = ctx.request.body
    checkRoleAllowed(role.roleId)
    await checkRoleDataScope(role.roleId)
    const row = await authDataScope(role)
    ctx.body = body.success(row)
  } catch (err) {
    console.log(err.message, '-- DataScope Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  GetRoleList,
  ChangeStatus,
  Search,
  Add,
  Update,
  Delete,
  DeptTree,
  AllocatedList,
  UnAllocatedList,
  CancelAuthUser,
  CancelAuthUserAll,
  SelectAuthUserAll,
  Optionselect,
  DataScope,
}
