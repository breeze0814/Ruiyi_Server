const body = require('../../util/body.js')
const { getMenus, buildMenus } = require('../methods/routerFunc.js')

const GetRouters = async (ctx) => {
  try {
    const { userId } = ctx.loginUser
    const menus = await getMenus(userId)
    ctx.body = body.success(buildMenus(menus))
  } catch (err) {
    console.log(err, '--GetRouters error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = GetRouters
