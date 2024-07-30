const {
  List,
  GetInfo,
  TreeSelect,
  RoleMenuTreeSelect,
  Add,
  Edit,
  Remove,
} = require('../project/servers/menuService.js')

const router = require('koa-router')()

router.prefix('/system/menu')

router.get('/list', List)

router.get('/treeselect', TreeSelect)

router.get('/:menuId', GetInfo)

router.get('/roleMenuTreeselect/:roleId', RoleMenuTreeSelect)

router.post('/', Add)

router.put('/', Edit)

router.delete('/:menuId', Remove)

module.exports = router
