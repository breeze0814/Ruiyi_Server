const { isEmpty, formatDate, deepClone } = require('../../util/tools.js')
const UserConstants = require('../../configuration/UserConstants.js')
const { adaptor } = require('../../util/adaptor.js')
const sequelize = require('../../../resources/db/mysql.js')
const { sys_dept } = require('../../../resources/db/model')

const baseSql = `
    select
        d.dept_id as deptId, d.parent_id as parentId, d.ancestors,
        d.dept_name as deptName, d.order_num as orderNum, d.leader, d.phone,
        d.email, d.status, d.del_flag as delFlag, d.create_by as createBy, d.create_time as createTime
    from sys_dept d
`

async function selectDeptList(dept) {
  const { deptId, parentId, deptName, status } = dept

  let sql = baseSql + ` where d.del_flag = '0' `

  if (!isEmpty(deptId)) sql += ` AND dept_id = ${deptId} `

  if (!isEmpty(parentId)) sql += ` AND parent_id = ${parentId} `

  if (!isEmpty(deptName)) sql += ` AND dept_name like concat('%', '${deptName}', '%') `

  if (!isEmpty(status)) sql += ` AND status = ${status} `

  sql += ` order by d.parent_id, d.order_num `
  const final = (await sequelize.query(sql))[0]
  return final
}

async function checkDeptDataScope(deptId) {
  const depts = (
    await selectDeptList({
      deptId,
    })
  )[0]

  if (isEmpty(depts)) throw new Error('没有权限访问部门数据！')
}

async function selectDeptById(deptId) {
  const sql = `
        select
            d.dept_id as deptId, d.parent_id as parentId, d.ancestors,
            d.dept_name as deptName, d.order_num as orderNum, d.leader,
            d.phone, d.email, d.status,
			(select dept_name from sys_dept where dept_id = d.parent_id) as parentName
		from sys_dept d
		where d.dept_id = ${deptId}
    `

  const final = (await sequelize.query(sql))[0][0]
  return final
}

async function checkDeptNameUnique(dept) {
  const deptId = isEmpty(dept.deptId) ? -1 : dept.deptId
  const info = (
    await sequelize.query(
      baseSql +
        ` where dept_name = '${dept.deptName}' and parent_id = ${dept.parentId} and del_flag = '0' limit 1`,
    )
  )[0][0]
  if (!isEmpty(info) && info.deptId !== Number(deptId)) {
    return UserConstants.NOT_UNIQUE
  }
  return UserConstants.UNIQUE
}

async function insertDept(dept) {
  const info = await selectDeptById(dept.parentId)
  // 如果父节点不为正常状态,则不允许新增子节点
  if (UserConstants.DEPT_NORMAL !== info.status) throw new Error('部门停用，不允许新增')
  dept.ancestors = info.ancestors + ',' + dept.parentId
  dept.create_time = formatDate(new Date())
  await sys_dept.create(adaptor(dept))
}

async function updateDept(dept) {
  const newParentDept = await selectDeptById(dept.parentId)
  const oldDept = await selectDeptById(dept.deptId)

  if (!isEmpty(newParentDept) && !isEmpty(oldDept)) {
    const newAncestors = newParentDept.ancestors + ',' + newParentDept.deptId
    const oldAncestors = oldDept.ancestors
    dept.ancestors = newAncestors
    await updateDeptChildren(dept.deptId, newAncestors, oldAncestors)
  }

  dept.update_time = formatDate(new Date())
  const result = (
    await sys_dept.update(adaptor(deepClone(dept)), {
      where: {
        dept_id: dept.deptId,
      },
    })
  )[0]
  if (
    UserConstants.DEPT_NORMAL === dept.status &&
    !isEmpty(dept.ancestors) &&
    dept.acestors !== '0'
  )
    await updateParentDeptStatusNormal(dept)

  return result
}

async function updateDeptChildren(deptId, newAncestors, oldAncestors) {
  const children = (
    await sequelize.query(`select * from sys_dept where find_in_set(${deptId}, ancestors)`)
  )[0]

  for (const c of children) {
    c.ancestors = c.ancestors.replace(oldAncestors, newAncestors)
  }

  if (children.length > 0) {
    for (const item of children) {
      await sys_dept.update(
        {
          acestors: item.acestors,
        },
        {
          where: {
            dept_id: item.deptId,
          },
        },
      )
    }
  }
}

async function updateParentDeptStatusNormal(dept) {
  const deptIds = dept.ancestors.split(',')
  let sql = `update sys_dept set status = '0' where dept_id in (`
  for (const id of deptIds) {
    sql += `${id},`
  }
  sql = sql.substring(0, sql.length - 1) + ')'
  await sequelize.query(sql)
}

async function hasChildByDeptId(deptId) {
  const sql = `
        select
            count(1) as count from sys_dept
        where del_flag = '0' and parent_id = ${deptId} limit 1
        `
  const count = (await sequelize.query(sql))[0][0].count

  return count > 0
}

async function checkDeptExistUser(deptId) {
  const sql = `select count(1) from sys_user where dept_id = ${deptId} and del_flag = '0'`
  const count = (await sequelize.query(sql))[0][0].count
  return count > 0
}

module.exports = {
  selectDeptList,
  checkDeptDataScope,
  selectDeptById,
  checkDeptNameUnique,
  insertDept,
  updateDept,
  hasChildByDeptId,
  checkDeptExistUser,
}
