const {
  Add_DICT_TYPE,
  Edit_DICT_TYPE,
  Delete_DICT_TYPE,
  List_DICT_TYPE,
  Optionselect_DICT_TYPE,
  Type_DICT_TYPE,
  Refresh_DICT_TYPE,
} = require('../project/servers/dictTypeService.js')

const router = require('koa-router')()

router.prefix('/system/dict/type')
//字典页面相关路由
router.get('/list', List_DICT_TYPE)
router.get('/optionselect', Optionselect_DICT_TYPE)
router.get('/:id', Type_DICT_TYPE)
//编辑
router.put('/', Edit_DICT_TYPE)
//新增
router.post('/', Add_DICT_TYPE)
//刷新
router.delete('/refreshCache', Refresh_DICT_TYPE)
//删除
router.delete('/:ids', Delete_DICT_TYPE)
module.exports = router
