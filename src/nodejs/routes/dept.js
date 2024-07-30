const {
  List,
  ExcludeChild,
  GetInfo,
  Add,
  Edit,
  Remove,
} = require('../project/servers/deptService.js')

const router = require('koa-router')()

router.prefix('/system/dept')

router.get('/list', List)

router.get('/list/exclude/:deptId', ExcludeChild)

router.get('/:deptId', GetInfo)

router.post('/', Add)

router.put('/', Edit)

router.delete('/:deptId', Remove)

module.exports = router
