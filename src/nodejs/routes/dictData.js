const {
  List,
  GetInfo,
  DictType,
  Add,
  Edit,
  Remove,
} = require('../project/servers/dictDataService.js')

const router = require('koa-router')()

router.prefix('/system/dict/data')

router.get('/list', List)

router.get('/:dictCode', GetInfo)

router.get('/type/:dictType', DictType)

router.post('/', Add)

router.put('/', Edit)

router.delete('/:dictCodes', Remove)

module.exports = router
