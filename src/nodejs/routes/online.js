const { List } = require('../project/servers/onlineService.js')

const router = require('koa-router')()

router.prefix('/monitor/online')

router.get('/list', List)

module.exports = router
