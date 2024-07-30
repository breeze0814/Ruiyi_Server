const body = require('../../util/body.js')
const {
  selectMenuList,
  selectMenuById,
  buildMenuTreeSelect,
  selectMenuListByRoleId,
  checkMenuNameUnique,
  hasChildByMenuId,
  checkMenuExistRole,
} = require('../methods/menuFunc.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { adaptor } = require('../../util/adaptor.js')
const { sys_menu } = require('../../../resources/db/model')
const sequelize = require('../../../resources/db/mysql.js')

/**
 * 获取菜单列表
 * @param {menu} ctx.request.query
 */
const List = async (ctx) => {
  try {
    const menu = ctx.request.query
    const data = await selectMenuList(menu, ctx.loginUser.userId)
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- List Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 根据菜单编号获取详细信息
 * @param {menuId} ctx.params
 */
const GetInfo = async (ctx) => {
  try {
    const { menuId } = ctx.params
    const data = await selectMenuById(menuId)
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- GetInfo Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 获取菜单下拉树列表
 * @param {menu} ctx.request.query
 */
const TreeSelect = async (ctx) => {
  try {
    const menu = ctx.request.query
    const menus = await selectMenuList(menu, ctx.loginUser.userId)
    const data = await buildMenuTreeSelect(menus)
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- TreeSelect Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 加载对应角色菜单列表树
 * @param {menu} ctx.request.body
 */
const RoleMenuTreeSelect = async (ctx) => {
  try {
    const { roleId } = ctx.params
    const menus = await selectMenuList({}, ctx.loginUser.userId)
    const checkedKeys = await selectMenuListByRoleId(roleId)
    ctx.body = {
      code: 200,
      msg: '查询成功',
      menus: await buildMenuTreeSelect(menus),
      checkedKeys,
    }
  } catch (err) {
    console.log(err.message, '-- roleMenuTreeSelect Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增菜单
 * @param {menu} ctx.request.body
 * @returns
 */
const Add = async (ctx) => {
  try {
    const menu = ctx.request.body
    if (!(await checkMenuNameUnique(menu)))
      throw new Error(`新增菜单【${menu.menuName}】失败，菜单已存在`)
    else if (
      UserConstants.YES_FRAME === menu.isFrame &&
      !(menu.path.startsWith('http://') || menu.path.startsWith('https://'))
    )
      throw new Error(`新增菜单【${menu.menuName}】失败，地址必须以http(s)://开头`)
    menu.create_by = ctx.loginUser.userName
    await sys_menu.create({
      ...adaptor(menu),
    })
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改菜单
 * @param {menu} ctx.request.body
 */
const Edit = async (ctx) => {
  try {
    const menu = ctx.request.body
    if (!(await checkMenuNameUnique(menu)))
      throw new Error(`修改菜单【${menu.menuName}】失败，菜单已存在`)
    else if (
      UserConstants.YES_FRAME === menu.isFrame &&
      !(menu.path.startsWith('http://') || menu.path.startsWith('https://'))
    )
      throw new Error(`修改菜单【${menu.menuName}】失败，地址必须以http(s)://开头`)
    else if (menu.menuId === menu.parentId)
      throw new Error(`修改菜单【${menu.menuName}】失败，上级菜单不能选择自己`)

    menu.update_by = ctx.loginUser.userName

    await sys_menu.update(
      {
        ...adaptor(menu),
      },
      {
        where: {
          menu_id: menu.menu_id,
        },
      },
    )
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Edit Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 删除菜单
 * @param {menuId} ctx.params
 */
const Remove = async (ctx) => {
  try {
    const { menuId } = ctx.params
    if (await hasChildByMenuId(menuId)) throw new Error('存在子菜单,不允许删除')

    if (await checkMenuExistRole(menuId)) throw new Error('菜单已分配,不允许删除')

    await sequelize.query(`delete from sys_menu where menu_id = ${menuId}`)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Remove Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  List,
  GetInfo,
  TreeSelect,
  RoleMenuTreeSelect,
  Add,
  Edit,
  Remove,
}
