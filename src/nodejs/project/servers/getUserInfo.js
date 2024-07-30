const sequelize = require('../../../resources/db/mysql.js')
const body = require('../../util/body.js')
const { isEmpty } = require('../../util/tools.js')
const { selectMenuPermsByUserId, selectMenuPermsByRoleId } = require('../methods/menuFunc.js')

const GetUserInfo = async (ctx) => {
  try {
    const loginUser = ctx.loginUser
    const roles = await getUserRoles(loginUser)
    const permissions = await getUserPermissions(loginUser)
    ctx.body = {
      code: 200,
      msg: '操作成功',
      user: loginUser,
      roles: [...roles],
      permissions: [...permissions],
    }
  } catch (err) {
    ctx.body = body.fail(err.message)
  }
}

async function getUserRoles(loginUser) {
  const roles = new Set()
  if (loginUser.userId === 1) roles.add('admin')
  else {
    const roleList = (
      await sequelize.query(
        `select distinct r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope, r.menu_check_strictly, r.dept_check_strictly,
                r.status, r.del_flag, r.create_time, r.remark
            from sys_role r
                left join sys_user_role ur on ur.role_id = r.role_id
                left join sys_user u on u.user_id = ur.user_id
                left join sys_dept d on u.dept_id = d.dept_id
            WHERE r.del_flag = '0' and ur.user_id = ${loginUser.userId}`,
      )
    )[0]
    for (const item of roleList) {
      if (!isEmpty(item)) {
        const role = item.role_key.trim().split(',')
        for (const iterator of role) {
          roles.add(iterator)
        }
      }
    }
  }

  return roles
}

async function getUserPermissions(loginUser) {
  const perms = new Set()
  if (loginUser.userId === 1) perms.add('*:*:*')
  else {
    const roleIds = loginUser.roleId
    if (!isEmpty(roleIds)) {
      // 多角色设置permissions属性，以便数据权限匹配权限
      for (const roleId of roleIds) {
        await selectMenuPermsByRoleId(roleId, perms)
      }
    } else {
      await selectMenuPermsByUserId(loginUser.userId, perms)
    }
  }

  return perms
}

module.exports = {
  GetUserInfo,
  getUserPermissions,
}
