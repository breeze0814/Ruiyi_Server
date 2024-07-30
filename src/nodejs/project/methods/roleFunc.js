// const { isEmpty, deepClone } = require('../../../../util/tools.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { adaptor } = require('../../util/adaptor.js')
const sequelize = require('../../../resources/db/mysql.js')
const { deepClone, isEmpty } = require('../../util/tools.js')
const { sys_role } = require('../../../resources/db/model')

const baseSql = `
      select
        distinct r.role_id as roleId, r.role_name as roleName, r.role_key as roleKey,
        r.role_sort as roleSort, r.data_scope as dataScope, r.menu_check_strictly as menuCheckStrictly,
        r.dept_check_strictly as deptCheckStrictly,
        r.status, r.del_flag as delFlag, r.create_time as createTime, r.remark
      from sys_role r
        left join sys_user_role ur on ur.role_id = r.role_id
        left join sys_user u on u.user_id = ur.user_id
        left join sys_dept d on u.dept_id = d.dept_id
        `

/**
 * 获取角色列表
 * @param {*} role
 * @returns
 */
async function searchRoleList(role, method) {
  const { 'params[beginTime]': beginTime, 'params[endTime]': endTime } = role
  let sql = `
        select
            distinct r.role_id as roleId, r.role_name as roleName, r.role_key as roleKey, r.role_sort as roleSort,
            r.data_scope as dataScope, r.menu_check_strictly as menuCheckStrictly, r.dept_check_strictly as deptCheckStrictly,
            r.status, r.del_flag as delFlag, r.create_time as createTime, r.remark, false as flag,
            case when r.role_id = 1 then true else false end as admin
        from sys_role r
	        left join sys_user_role ur on ur.role_id = r.role_id
	        left join sys_user u on u.user_id = ur.user_id
	        left join sys_dept d on u.dept_id = d.dept_id
        where r.del_flag = '0'
        `
  if (!isEmpty(role?.roleId)) {
    sql += `and r.role_id = ${role.roleId} `
  }

  if (!isEmpty(role?.roleName)) {
    const a = method ? `='${role.roleName}' ` : `like  '%${role.roleName}%' `
    sql += `and r.role_name ` + a
  }

  if (!isEmpty(role?.roleKey)) {
    const k = method ? ` = '${role.roleKey}' ` : ` like '%${role.roleKey}%' `
    sql += `and r.role_key ` + k
  }
  if (!isEmpty(beginTime) && !isEmpty(endTime)) {
    sql += `and r.create_time between '${beginTime}' and '${endTime}' `
  }
  sql += `order by r.role_sort `
  let list = (await sequelize.query(sql))[0]
  if (list.length === 0) return list
  list[0].menuCheckStrictly = Boolean(list[0]?.menuCheckStrictly)
  list[0].deptCheckStrictly = Boolean(list[0]?.deptCheckStrictly)
  return list
}

/**
 * 校验用户信息
 * @param {*} params 检索信息
 * @return 结果
 */
async function checkRoleInfo(val) {
  const roleInfo = (await searchRoleList(val, 'add'))[0]
  if (!isEmpty(roleInfo)) return UserConstants.NOT_UNIQUE
  return UserConstants.UNIQUE
}

async function checkRoleNameUnique(role) {
  const roleId = isEmpty(role.roleId) ? -1 : role.roleId
  let sql =
    deepClone(baseSql) +
    `
      where r.role_name='${role.roleName}' and r.del_flag = '0' limit 1
  `
  const info = (await sequelize.query(sql))[0][0]
  if (!isEmpty(info) && info.roleId !== roleId) return UserConstants.NOT_UNIQUE
  return UserConstants.UNIQUE
}

async function checkRoleKeyUnique(role) {
  const roleId = isEmpty(role.roleId) ? -1 : role.roleId
  let sql =
    deepClone(baseSql) +
    `
      where r.role_key='${role.roleKey}' and r.del_flag = '0' limit 1
  `
  const info = (await sequelize.query(sql))[0][0]
  if (!isEmpty(info) && info.roleId !== roleId) return UserConstants.NOT_UNIQUE
  return UserConstants.UNIQUE
}

/**
 * 新增角色菜单信息
 * @param {*} role 角色对象
 */
async function insertRoleMenu(role) {
  let menuIds = []
  if (role.menu_ids.length === 0) return role.menu_ids.length
  if (typeof role?.menu_ids === 'string' && role?.menu_ids.indexOf(',') !== -1) {
    menuIds = role.menu_ids.split(',')
  } else {
    menuIds = [...role.menu_ids]
  }
  let sql = `insert into sys_role_menu (role_id, menu_id) values `
  for (const menuId of menuIds) {
    sql += `(${role.role_id}, ${menuId}),`
  }
  sql = sql.substring(0, sql.length - 1)
  await sequelize.query(sql)
  return menuIds.length
}
/**
 * 权限判断
 * @param {*} id
 */
function checkRoleAllowed(id) {
  if (!isEmpty(id) && id === 1) throw new Error('不允许操作超级管理员用户')
}

/**
 * 检查用户权限
 * @param {*} id
 */
async function checkRoleDataScope(id) {
  if (id !== 1) {
    const val = {
      id,
    }
    const list = await searchRoleList(val)
    if (isEmpty(list)) {
      throw new Error('没有权限访问用户数据！')
    }
  }
}

/**
 * 修改数据权限信息
 * @param {*} role 角色信息
 * @returns 结果
 */
async function authDataScope(role) {
  const roleId = role.roleId
  const deptIds = role.deptIds
  // const deptIds = role.deptIds.split(',')
  // delete role.deptIds
  role = adaptor(role)
  // 修改角色信息
  await sys_role.update(
    {
      ...role,
    },
    {
      where: {
        role_id: roleId,
      },
    },
  )
  // 删除角色与部门关联
  await sequelize.query(`delete from sys_role_dept where role_id=${roleId}`)

  // 新增角色和部门信息（数据权限）
  if (!isEmpty(deptIds)) {
    let sql = `insert into sys_role_dept(role_id, dept_id) values`
    for (const item of deptIds) {
      sql += `(${roleId}, ${item}),`
    }
    sql = sql.replace(/.$/, '')
    await sequelize.query(sql)
    return deptIds.length
  }
}

module.exports = {
  searchRoleList,
  checkRoleAllowed,
  checkRoleDataScope,
  checkRoleInfo,
  insertRoleMenu,
  authDataScope,
  checkRoleNameUnique,
  checkRoleKeyUnique,
}
