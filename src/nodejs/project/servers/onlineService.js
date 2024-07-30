const body = require('../../util/body.js')

const List = async (ctx) => {
  try {
    // const { ipaddr, userName } = ctx.request.query

    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- List Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 强退用户
 */
const ForceLogout = async (ctx) => {
  try {
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- ForceLogout Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  List,
  ForceLogout,
}
