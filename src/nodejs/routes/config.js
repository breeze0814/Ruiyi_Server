const router = require('koa-router')()

const {
  List,
  Search,
  Add,
  Update,
  Delete,
  GetConfigKey,
  RefreshCache,
} = require('../project/servers/configService.js')

router.prefix('/system/config')

// 获取参数配置列表
router.get('/list', List)

// 新增参数配置
router.post('/', Add)

// 修改参数配置
router.put('/', Update)
// 刷新参数缓存
router.delete('/refreshCache', RefreshCache)

// 删除参数配置
router.delete('/:configIds', Delete)
// 根据参数编号获取详细信息
router.get('/:configId', Search)

// 根据参数键名查询参数值
router.get('/configKey/:configKey', GetConfigKey)

module.exports = router
