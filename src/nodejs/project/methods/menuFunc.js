const { searchRoleList } = require('./roleFunc.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { isEmpty, deepClone } = require('../../util/tools.js')
const sequelize = require('../../../resources/db/mysql.js')

const baseSql =
  "select menu_id as menuId, menu_name as menuName, parent_id as parentId, order_num as orderNum, path, component, `query`, is_frame as isFrame, is_cache as isCache, menu_type as menuType, visible, status, ifnull(perms,'') as perms, icon, create_time as createTime from sys_menu "

async function selectMenuList(menu, userId) {
  // menu = !isEmpty(menu) ? JSON.parse(menu) : {}
  const { menuName, visible, status } = menu
  let sql = void 0
  let menuList = void 0
  if (userId === 1) {
    sql = deepClone(baseSql) + ` where 1=1 `
  } else {
    sql = `
        select
            distinct m.menu_id, m.parent_id, m.menu_name,
            m.path, m.component, m.query, m.visible,
            m.status, ifnull(m.perms,'') as perms, m.is_frame,
            m.is_cache, m.menu_type, m.icon, m.order_num, m.create_time
		from sys_menu m
            left join sys_role_menu rm on m.menu_id = rm.menu_id
            left join sys_user_role ur on rm.role_id = ur.role_id
            left join sys_role ro on ur.role_id = ro.role_id
		where ur.user_id = ${userId}
        `
  }

  if (!isEmpty(menuName)) sql += ` AND menu_name like concat('%', '${menuName}', '%')`

  if (!isEmpty(visible)) sql += ` AND visible = ${visible}`

  if (!isEmpty(status)) sql += ` AND status = ${status}`

  sql += ` order by parent_id, order_num`

  menuList = (await sequelize.query(sql))[0]
  return menuList
}

async function selectMenuById(menuId) {
  const sql = deepClone(baseSql) + ` where menu_id = ${menuId}`
  const data = (await sequelize.query(sql))[0][0]
  return data
}

async function buildMenuTreeSelect(menus) {
  const menuTrees = await buildMenuTree(menus)
  const final = []
  for (const item of menuTrees) {
    const obj = {
      id: item.menuId,
      label: item.menuName,
      children: item.children,
    }
    final.push(obj)
  }

  return final
}

async function buildMenuTree(menus) {
  let returnList = []

  const tempList = []
  menus.map((item) => {
    tempList.push(item.menuId)
  })

  for (const menu of menus) {
    // 如果是顶级节点, 遍历该父节点的所有子节点
    if (!tempList.includes(menu.parentId)) {
      recursionFnForMenu(menus, menu)
      returnList.push(menu)
    }
  }
  return returnList.length === 0 ? menus : returnList
}

function recursionFnForMenu(list, kid) {
  const kids = getKidsForMenu(list, kid)
  kid.children = kids
  for (let i = 0; i < kids.length; i++) {
    if (getKidsForMenu(list, kids[i]).length > 0) kids[i] = recursionFnForMenu(list, kids[i])
  }
  return kid
}

function getKidsForMenu(list, kid) {
  const id = kid.menuId ? kid.menuId : kid.id
  const tList = []
  for (const iterator of list) {
    let parentId = iterator.parentId || iterator.parent_id
    if (parentId === id) {
      const obj = {
        id: iterator.menuId,
        label: iterator.menuName,
        children: iterator.children,
      }
      tList.push(obj)
    }
  }
  return tList
}

async function selectMenuListByRoleId(roleId) {
  const { menuCheckStrictly } = (
    await searchRoleList({
      roleId,
    })
  )[0]

  let sql = `
    select m.menu_id as menuId
	from sys_menu m
        left join sys_role_menu rm on m.menu_id = rm.menu_id
    where rm.role_id = ${roleId}
    `

  if (!isEmpty(menuCheckStrictly))
    sql += ` and m.menu_id not in (select m.parent_id from sys_menu m inner join sys_role_menu rm on m.menu_id = rm.menu_id and rm.role_id = ${roleId})`

  sql += `order by m.parent_id, m.order_num`

  const final = []
  for (const item of (await sequelize.query(sql))[0]) {
    final.push(item.menuId)
  }
  return final
}

async function checkMenuNameUnique(menu) {
  const menuId = isEmpty(menu.menuId) ? -1 : menu.menuId
  const info = (
    await sequelize.query(deepClone(baseSql) + ` where menu_name = '${menu.menuName}' limit 1`)
  )[0][0]
  if (!isEmpty(info) && info.menuId !== menuId) {
    return UserConstants.NOT_UNIQUE
  }
  return UserConstants.UNIQUE
}

async function hasChildByMenuId(menuId) {
  const sql = `select count(1) as count from sys_menu where parent_id = ${menuId}`
  const count = (await sequelize.query(sql))[0][0].count
  return count > 0
}

async function checkMenuExistRole(menuId) {
  const sql = `select count(1) as count from sys_role_menu where menu_id = ${menuId}`
  const count = (await sequelize.query(sql))[0][0].count
  return count > 0
}

async function selectMenuPermsByRoleId(roleId, perms) {
  const menus = (
    await sequelize.query(
      `
      select distinct m.perms
      from sys_menu m
        left join sys_role_menu rm on m.menu_id = rm.menu_id
      where m.status = '0' and rm.role_id = ${roleId}
      `,
    )
  )[0]

  for (const menu of menus) {
    if (!isEmpty(menu?.perms)) {
      const item = menu.perms.trim().split(',')
      for (const iterator of item) {
        perms.add(iterator)
      }
    }
  }
}

async function selectMenuPermsByUserId(userId, perms) {
  const menus = (
    await sequelize.query(
      `
      select
          distinct m.perms
      from sys_menu m
          left join sys_role_menu rm on m.menu_id = rm.menu_id
          left join sys_user_role ur on rm.role_id = ur.role_id
          left join sys_role r on r.role_id = ur.role_id
      where m.status = '0' and r.status = '0' and ur.user_id = ${userId}
      `,
    )
  )[0]

  for (const menu of menus) {
    if (!isEmpty(menu?.perms)) {
      const item = menu.perms.trim().split(',')
      for (const iterator of item) {
        perms.add(iterator)
      }
    }
  }
}

module.exports = {
  selectMenuList,
  selectMenuById,
  buildMenuTreeSelect,
  selectMenuListByRoleId,
  checkMenuNameUnique,
  hasChildByMenuId,
  checkMenuExistRole,
  selectMenuPermsByRoleId,
  selectMenuPermsByUserId,
}
