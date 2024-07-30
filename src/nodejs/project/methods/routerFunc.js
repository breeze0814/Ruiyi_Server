const sequelize = require('../../../resources/db/mysql.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { isEmpty } = require('../../util/tools.js')

/**
 * 根据用户ID查询菜单
 * @param {*} id 用户名称
 * @returns 菜单列表
 */
async function getMenus(id) {
  let menus = []
  if (id === 1) {
    menus = (
      await sequelize.query(
        `
            select distinct m.menu_id as menuId, m.parent_id, m.menu_name, m.path, m.component, m.query, m.visible, m.status, ifnull(m.perms,'') as perms, m.is_frame, m.is_cache, m.menu_type, m.icon, m.order_num, m.create_time
            from sys_menu m where m.menu_type in ('M', 'C') and m.status = 0
            order by m.parent_id, m.order_num
            `,
      )
    )[0]
  } else {
    menus = (
      await sequelize.query(
        `
            select distinct m.menu_id as menuId, m.parent_id, m.menu_name, m.path, m.component, m.query, m.visible, m.status, ifnull(m.perms,'') as perms, m.is_frame, m.is_cache, m.menu_type, m.icon, m.order_num, m.create_time
            from sys_menu m
                left join sys_role_menu rm on m.menu_id = rm.menu_id
                left join sys_user_role ur on rm.role_id = ur.role_id
                left join sys_role ro on ur.role_id = ro.role_id
                left join sys_user u on ur.user_id = u.user_id
            where u.user_id = ${id} and m.menu_type in ('M', 'C') and m.status = 0  AND ro.status = 0
            order by m.parent_id, m.order_num
            `,
      )
    )[0]
  }
  return menuTree(menus, 0)
}

/**
 * 根据父节点的ID获取所有子节点
 * @param {*} menus 所有菜单
 * @param {*} parent Id传入的父节点id
 * @returns
 */
function menuTree(menus, parentId) {
  const final = []
  for (const item of menus) {
    if (item.parent_id === parentId) {
      const one = recursionFn(menus, item)
      final.push(one)
    }
  }
  return final
}

/**
 * 递归列表
 * @param {*} menus 分类表
 * @param {*} kid 子节点
 */
function recursionFn(list, kid) {
  const kids = getKids(list, kid)
  kid.children = kids
  for (let i = 0; i < kids.length; i++) {
    if (getKids(list, kids[i]).length > 0) kids[i] = recursionFn(list, kids[i])
  }
  return kid
}

/**
 * 得到子节点列表
 * @param {*} list
 * @param {*} kid
 * @returns
 */
function getKids(list, kid) {
  const id = kid.menuId ? kid.menuId : kid.id
  const tList = []
  for (const iterator of list) {
    let parentId = iterator.parentId || iterator.parent_id
    if (parentId === id) tList.push(iterator)
  }
  return tList
}

/**
 * 构建前端路由所需要的菜单
 * @param {*} menus 菜单列表
 * @returns 路由列表
 */
function buildMenus(menus) {
  const routers = []
  for (const menu of menus) {
    const router = {}
    router.hidden = menu.visible === '1'
    router.name = getRouteName(menu)
    router.path = getRouterPath(menu)
    router.component = getComponent(menu)
    router.query = menu.query
    router.meta = {
      title: menu.menu_name,
      icon: menu.icon,
      noCache: menu.is_cache === '1',
      link: menu.path.startsWith('http://') || menu.path.startsWith('https://') ? menu.path : null,
    }

    const cMenus = menu.children
    if (!isEmpty(cMenus) && UserConstants.TYPE_DIR === menu.menu_type) {
      router.alwaysShow = true
      router.redirect = 'noRedirect'
      router.children = buildMenus(cMenus)
    } else if (isMenuFrame(menu)) {
      router.meta = null
      const childrenList = []
      const children = {}
      children.path = menu.path
      children.component = menu.component
      children.name = upFirstWord(menu.path)
      children.query = menu.query
      children.meta = {
        title: menu.menu_name,
        icon: menu.icon,
        noCache: menu.is_cache === '1',
        link: menu.path.startsWith('http://') || menu.path.startsWith('https://') ? menu.path : '',
      }
      childrenList.push(children)
      router.children = childrenList
    } else if (menu.parent_id === 0 && isInnerLink(menu)) {
      router.meta = {
        title: menu.menu_name,
        icon: menu.icon,
      }
      router.path = '/'
      const childrenList = []
      const children = {}
      let routerPath = menu.path
        .replace('http://', '')
        .replace('https://', '')
        .replace('www.', '')
        .replace('.', '/')
        .replace(':', '/')
      children.path = routerPath
      children.component = UserConstants.INNER_LINK
      children.name = upFirstWord(routerPath)
      children.meta = {
        title: menu.menu_name,
        icon: menu.icon,
        link: menu.path,
      }
      childrenList.push(children)
      router.children = childrenList
    }

    routers.push(router)
  }
  return routers
}

/**
 * 获取路由名称
 * @param {*} menu 菜单信息
 * @returns 路由名称
 */
function getRouteName(menu) {
  let routerName = upFirstWord(menu.path)
  // 非外链并且是一级目录（类型为目录）
  if (isMenuFrame(menu)) routerName = ''
  return routerName
}

/**
 * 获取路由地址
 * @param {*} menu 菜单信息
 * @returns 路由地址
 */
function getRouterPath(menu) {
  let routerPath = menu.path
  // 内链打开外网方式
  if (menu.parent_id !== 0 && isInnerLink(menu)) {
    routerPath = routerPath
      .replace('http://', '')
      .replace('https://', '')
      .replace('www.', '')
      .replace('.', '/')
      .replace(':', '/')
  }

  // 非外链并且是一级目录（类型为目录）
  if (
    Number(menu.parent_id) === 0 &&
    menu.menu_type === UserConstants.TYPE_DIR &&
    menu.is_frame === Number(UserConstants.NO_FRAME)
  ) {
    routerPath = '/' + menu.path
  }
  // 非外链并且是一级目录（类型为菜单）
  else if (isMenuFrame(menu)) {
    routerPath = '/'
  }
  return routerPath
}

/**
 * 获取组件信息
 * @param {*} menu 菜单信息
 * @returns 组件信息
 */
function getComponent(menu) {
  let component = UserConstants.LAYOUT
  if (!isEmpty(menu.component) && !isMenuFrame(menu)) component = menu.component
  else if (isEmpty(menu.component) && menu.parent_id !== 0 && isInnerLink(menu))
    component = UserConstants.INNER_LINK
  else if (isEmpty(menu.component) && isParentView(menu)) component = UserConstants.PARENT_VIEW
  return component
}

/**
 * 是否为内链组件
 * @param {*} menu 菜单信息
 * @returns 结果
 */
function isInnerLink(menu) {
  return (
    menu.is_frame === UserConstants.NO_FRAME &&
    (menu.path.startsWith('http://') || menu.path.startsWith('https://'))
  )
}

/**
 * 是否为菜单内部跳转
 * @param {*} menu 菜单信息
 * @return {*} 结果
 */
function isMenuFrame(menu) {
  return (
    menu.parent_id === 0 &&
    menu.menu_type === UserConstants.TYPE_MENU &&
    menu.is_frame === Number(UserConstants.NO_FRAME)
  )
}

/**
 * 是否为parent_view组件
 * @param {*} menu 菜单信息
 * @returns 结果
 */
function isParentView(menu) {
  return menu.parent_id !== 0 && UserConstants.TYPE_DIR === menu.menu_type
}

/**
 * 大写第一个字
 * @param {*} val
 * @returns
 */
function upFirstWord(val) {
  return val[0].toUpperCase() + val.slice(1)
}

/**
 * 根据条件分页查询已分配用户角色列表
 * @param {*} val 用户信息
 * @returns 用户信息集合信息
 */
async function selectAllocatedList(val) {
  const { roleId, userName, phonenumber } = val

  if (isEmpty(roleId)) throw new Error('请输入角色')

  let sql = `
        select
            distinct u.user_id as userId, u.dept_id as deptId, u.user_name as userName,
            u.nick_name as nickName, u.email, u.phonenumber, u.status,
            u.create_time as createTime, case when u.user_id = 1 then true else false end as admin
	    from sys_user u
			 left join sys_dept d on u.dept_id = d.dept_id
			 left join sys_user_role ur on u.user_id = ur.user_id
			 left join sys_role r on r.role_id = ur.role_id
	    where u.del_flag = '0' and r.role_id = ${roleId}
        `
  if (!isEmpty(userName)) sql += `and u.user_name like concat('%', '${userName}', '%')`

  if (!isEmpty(phonenumber)) sql += `and u.user_name like concat('%', ${phonenumber}, '%')`

  const list = (await sequelize.query(sql))[0]

  return list
}

/**
 * 根据条件分页查询未分配用户角色列表
 * @param {*} val 用户信息
 * @returns 用户信息集合信息
 */
async function selectUnAllocatedList(val) {
  const { roleId, userName, phonenumber } = val

  if (isEmpty(roleId)) throw new Error('请输入角色')

  let sql = `
        select
            distinct u.user_id as userId, u.dept_id as deptId, u.user_name as userName,
            u.nick_name as nickName, u.email, u.phonenumber, u.status, u.create_time as createTime,
            case when u.user_id = 1 then true else false end as admin
	    from sys_user u
			 left join sys_dept d on u.dept_id = d.dept_id
			 left join sys_user_role ur on u.user_id = ur.user_id
			 left join sys_role r on r.role_id = ur.role_id
	    where u.del_flag = '0' and (r.role_id != ${roleId} or r.role_id IS NULL)
	    and u.user_id not in
        (select u.user_id from sys_user u inner join sys_user_role ur on u.user_id = ur.user_id and ur.role_id = ${roleId})
        `
  if (!isEmpty(userName)) sql += `and u.user_name like concat('%', '${userName}', '%') `

  if (!isEmpty(phonenumber)) sql += `and u.user_name like concat('%', ${phonenumber}, '%') `

  const list = (await sequelize.query(sql))[0]

  return list
}

module.exports = {
  getMenus,
  buildMenus,
  recursionFn,
  selectAllocatedList,
  selectUnAllocatedList,
}
