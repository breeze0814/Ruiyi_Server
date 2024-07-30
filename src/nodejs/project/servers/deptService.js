const body = require('../../util/body.js')
const { formatDate } = require('../../util/tools.js')
const UserConstants = require('../../configuration/UserConstants.js')
const {
  selectDeptList,
  checkDeptDataScope,
  selectDeptById,
  insertDept,
  checkDeptNameUnique,
  updateDept,
  hasChildByDeptId,
  checkDeptExistUser,
} = require('../methods/deptFunc.js')
const sequelize = require('../../../resources/db/mysql.js')

/**
 * 获取部门列表
 * @param {dept} ctx.request.query
 */
const List = async (ctx) => {
  try {
    const dept = ctx.request.query
    const list = await selectDeptList(dept)
    ctx.body = body.success(list)
  } catch (err) {
    console.log(err.message, '-- Dept List Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 查询部门列表（排除节点）
 * @param {deptId} ctx.params
 */
const ExcludeChild = async (ctx) => {
  try {
    const { deptId } = ctx.params
    const depts = await selectDeptList({})
    const data = []
    for (const d of depts) {
      if (d.deptId != Number(deptId) && !d.ancestors.split(',').includes(deptId)) data.push(d)
    }
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- Dept ExcludeChild Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 根据部门编号获取详细信息
 * @param {deptId} ctx.params
 */
const GetInfo = async (ctx) => {
  try {
    const { deptId } = ctx.params
    if (ctx.loginUser.userId !== 1) await checkDeptDataScope(deptId)

    const data = await selectDeptById(deptId)
    ctx.body = body.success(data)
  } catch (err) {
    console.log(err.message, '-- Dept GetInfo Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 新增部门
 * @param {dept} ctx.request.body
 */
const Add = async (ctx) => {
  try {
    const dept = ctx.request.body
    if (!(await checkDeptNameUnique(dept)))
      throw new Error(`新增部门【${dept.deptName}】失败，部门名称已存在`)

    dept.create_by = ctx.loginUser.userName
    await insertDept(dept)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Dept Add Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 修改部门
 * @param {dept} ctx.request.body
 */
const Edit = async (ctx) => {
  try {
    const dept = ctx.request.body
    const deptId = dept.deptId
    await checkDeptDataScope(deptId)

    if (!(await checkDeptNameUnique(dept)))
      throw new Error(`修改部门【${dept.deptName}】失败，部门名称已存在`)
    else if (dept.parentId === deptId)
      throw new Error(`修改部门【${dept.deptName}】失败，上级部门不能是自己`)
    else if (
      UserConstants.DEPT_DISABLE === dept.status &&
      (
        await sequelize.query(
          `select
                    count(*) as count
                from sys_dept
                where status = 0 and del_flag = '0' and find_in_set(${deptId}, ancestors)`,
        )
      )[0][0].count > 0
    )
      throw new Error('该部门包含未停用的子部门！')

    dept.update_by = ctx.loginUser.userName
    dept.update_time = formatDate(new Date())

    await updateDept(dept)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Dept Edit Error')
    ctx.body = body.fail(err.message)
  }
}

/**
 * 删除部门
 * @param {deptId} ctx.params
 */
const Remove = async (ctx) => {
  try {
    const { deptId } = ctx.params
    if (await hasChildByDeptId(deptId)) throw new Error('存在下级部门,不允许删除')

    if (await checkDeptExistUser(deptId)) throw new Error('部门存在用户,不允许删除')

    await checkDeptDataScope(deptId)
    await sequelize.query(`update sys_dept set del_flag = '2' where dept_id = ${deptId}`)
    ctx.body = body.success()
  } catch (err) {
    console.log(err.message, '-- Dept Remove Error')
    ctx.body = body.fail(err.message)
  }
}

module.exports = {
  List,
  ExcludeChild,
  GetInfo,
  Add,
  Edit,
  Remove,
}
