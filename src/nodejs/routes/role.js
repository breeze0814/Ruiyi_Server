const {
  GetRoleList,
  ChangeStatus,
  Search,
  Add,
  Update,
  Delete,
  DeptTree,
  AllocatedList,
  UnAllocatedList,
  CancelAuthUser,
  CancelAuthUserAll,
  SelectAuthUserAll,
  Optionselect,
  DataScope,
} = require('../project/servers/roleService.js')
const router = require('koa-router')()

router.prefix('/system/role')

// 获取角色列表
router.get('/list', GetRoleList)

// 状态修改
router.put('/changeStatus', ChangeStatus)

// 获取角色选择框列表
router.get('/optionselect', Optionselect)

// 获取角色信息
router.get('/:roleId', Search)

// 新增角色信息
router.post('/', Add)

// 修改角色信息
router.put('/', Update)

// 删除角色信息
router.delete('/:roleIds', Delete)

// 获取对应角色部门树列表
router.get('/deptTree/:roleId', DeptTree)

// 查询已分配权限
router.get('/authUser/allocatedList', AllocatedList)

// 查询未分配权限
router.get('/authUser/unallocatedList', UnAllocatedList)

// 取消授权用户
router.put('/authUser/cancel', CancelAuthUser)

// 批量取消授权用户
router.put('/authUser/cancelAll', CancelAuthUserAll)

// 批量选择用户授权
router.put('/authUser/selectAll', SelectAuthUserAll)

// 修改保存数据权限
router.put('/dataScope', DataScope)

module.exports = router
