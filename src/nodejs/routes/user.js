const {
  GetUserList,
  Add,
  Search,
  Delete,
  Update,
  ResetPwd,
  AuthRole,
  EditAuthRole,
  ChangeStatus,
  DeptTree,
  PROFiLE,
  PROFiLE_EDIT,
  CHANGE_PWD,
} = require('../project/servers/userService.js')

const router = require('koa-router')()

router.prefix('/system/user')

// 获取用户列表
router.get('/list', GetUserList)

// 新增用户
router.get('/', Search)
router.post('/', Add)

// 获取部门树列表
router.get('/deptTree', DeptTree)
//个人中心
router.get('/profile', PROFiLE)
//个人中心修改
router.put('/profile', PROFiLE_EDIT)
//修改密码
router.put('/profile/updatePwd', CHANGE_PWD)

// 获取用户信息
router.get('/:userId', Search)

router.get('/', Search)

// 删除用户
router.delete('/:userIds', Delete)

// 更新用户
router.put('/', Update)

// 修改密码
router.put('/resetPwd', ResetPwd)

// 根据用户编号获取授权角色
router.get('/authRole/:userId', AuthRole)

// 用户授权角色
router.put('/authRole', EditAuthRole)

// 状态修改
router.put('/changeStatus', ChangeStatus)

module.exports = router
