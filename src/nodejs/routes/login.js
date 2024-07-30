const { produceSvg } = require('../project/methods/captchaFunc.js')
const GetRouters = require('../project/servers/getRouters.js')
const { GetUserInfo } = require('../project/servers/getUserInfo.js')
const { Login, Logout } = require('../project/servers/loginService.js')
const router = require('koa-router')()

// 登录
router.post('/login', Login)

//验证码
router.get('/captchaImage', produceSvg)

// 获取用户信息
router.get('/getInfo', GetUserInfo)

// 获取路由
router.get('/getRouters', GetRouters)

// 退出登录
router.post('/logout', Logout)

module.exports = router
