const {
  PostList,
  PostType,
  PostEdit,
  PostAdd,
  PostDelete,
} = require('../project/methods/postFunc.js')

const router = require('koa-router')()

router.prefix('/system/post')
//字典页面相关路由
router.get('/list', PostList)
// router.get('/optionselect', Optionselect)
router.get('/:id', PostType)
//编辑
router.put('/', PostEdit)
//新增
router.post('/', PostAdd)
// //删除
router.delete('/:ids', PostDelete)
module.exports = router
