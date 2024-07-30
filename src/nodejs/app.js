require('./util/initProcess.js')

const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session')
const useragent = require('koa-useragent').default
const login = require('./routes/login.js')
const config = require('./routes/config.js')
const dept = require('./routes/dept.js')
const dictData = require('./routes/dictData.js')
const dictType = require('./routes/dictType.js')
const menu = require('./routes/menu.js')
const online = require('./routes/online.js')
const post = require('./routes/post.js')
const role = require('./routes/role.js')
const user = require('./routes/user.js')
const { checkToken } = require('./util/jwt.js')
const { cacheConfig } = require('./project/methods/configFunc.js')
const { cacheDiceData } = require('./project/methods/dictDataFunc.js')

// error handler
onerror(app)
// middlewares
app.keys = ['your_secret_here']
app.use(bodyparser())
app.use(json())
app.use(logger())
app.use(useragent)
app.use(require('koa-static')(__dirname + '/public'))

// app.use(KoaCors());
app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  }),
)

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(checkToken)
app.use(session(app))
/**
 * 刷新系统里参数缓存和字典缓存
 */
cacheConfig()
cacheDiceData()
// routes
// router(app)
app.use(login.routes(), login.allowedMethods())
app.use(config.routes(), config.allowedMethods())
app.use(dept.routes(), dept.allowedMethods())
app.use(dictData.routes(), dictData.allowedMethods())
app.use(dictType.routes(), dictType.allowedMethods())
app.use(menu.routes(), menu.allowedMethods())
app.use(online.routes(), online.allowedMethods())
app.use(post.routes(), post.allowedMethods())
app.use(role.routes(), role.allowedMethods())
app.use(user.routes(), user.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
