const { isEmpty, formatDate } = require('../../util/tools.js')
const { sys_user_post, sys_user_role, sys_user } = require('../../../resources/db/model')
const UserConstants = require('../../configuration/UserConstants.js')
const sequelize = require('../../../resources/db/mysql.js')
const { adaptor, reverseAdaptor } = require('../../util/adaptor.js')
const { recursionFn } = require('./routerFunc.js')
const { Op } = require('sequelize')
const { comparePassword, hashPassword } = require('../../util/crypto.js')
/**
 * 查找用户列表
 * @param {*} user
 * @returns
 */
async function searchUserList(user) {
  const {
    pageSize,
    pageNum,
    userName,
    phonenumber,
    status,
    'params[beginTime]': beginTime,
    'params[endTime]': endTime,
  } = user
  const where = {
    del_flag: 0,
  }
  if (userName)
    Object.assign(where, {
      user_name: {
        [Op.like]: `%${userName}%`,
      },
    })
  if (phonenumber)
    Object.assign(where, {
      phonenumber: {
        [Op.like]: `%${phonenumber}%`,
      },
    })
  if (status)
    Object.assign(where, {
      status,
    })
  if (beginTime && endTime)
    Object.assign(where, {
      create_time: {
        [Op.between]: [beginTime, endTime],
      },
    })
  const page = pageNum || 1
  const size = pageSize || 10
  const userList = await sys_user.findAndCountAll({
    where,
    offset: (page - 1) * size,
    limit: +size,
    raw: true,
  })
  const result_ = []
  userList.rows.map((item) => {
    const a = {}
    for (const key in item) {
      if (key === 'password') {
        continue
      }
      a[reverseAdaptor(key)] = item[key]
    }
    result_.push(a)
  })
  userList.rows = result_
  return userList
}

/**
 * 校验用户信息
 * @param {*} params 检索信息
 * @return 结果
 */
async function checkUserInfo(params) {
  const userInfo = await sys_user.findOne({
    where: {
      ...params,
      del_flag: '0',
    },
    raw: true,
  })
  if (!isEmpty(userInfo) && userInfo.user_id !== params.user_id) return UserConstants.NOT_UNIQUE
  return UserConstants.UNIQUE
}

/**
 * 创建新用户
 * @param {*} user
 * @return 新增的用户
 */
async function insertUser(user) {
  user = adaptor(user)
  const newUser = (
    await sys_user.create({
      ...user,
      create_time: formatDate(new Date()),
    })
  ).dataValues

  newUser.postIds = user.posts
  newUser.roleIds = user.roleIds

  await insertUserPost(newUser)
  await insertUserRole(newUser)

  return newUser
}

/**
 * 创建用户和部门关联
 * @param {*} user
 */
async function insertUserPost(user) {
  const id = user.userId ? user.userId : user.user_id
  const posts = user.postIds
  if (!isEmpty(posts)) {
    for (const post of posts) {
      await sys_user_post.create({
        user_id: id,
        post_id: post,
      })
    }
  }
}

/**
 * 创建用户和权限关联
 * @param {*} user
 */
async function insertUserRole(user) {
  const id = user.userId ? user.userId : user.user_id
  if (!isEmpty(user.roleIds)) {
    for (const roleId of user.roleIds) {
      await sys_user_role.create({
        user_id: id,
        role_id: roleId,
      })
    }
  }
}
/**
 * 检查用户权限
 * @param {*} id
 */
async function checkUserDataScope(id) {
  if (id !== 1) {
    const val = {
      id,
    }
    const list = await searchUserList(val)
    if (isEmpty(list)) {
      throw new Error('没有权限访问用户数据！')
    }
  }
}

/**
 * 获取所有权限实例
 * @param {*} role
 * @returns
 */
async function selectRoleList() {
  let sql = `
        select distinct r.role_id as roleId, r.role_name as roleName, r.role_key as roleKey, r.role_sort as roleSort,
            r.data_scope as dataScope, r.menu_check_strictly as menuCheckStrictly, r.dept_check_strictly as deptCheckStrictly,
            r.status, r.del_flag as delFlag, r.create_time as createTime, r.remark,
            case when r.role_id = 1 then true else false end as admin
        from sys_role r
        left join sys_user_role ur on ur.role_id = r.role_id
        left join sys_user u on u.user_id = ur.user_id
        left join sys_dept d on u.dept_id = d.dept_id
        where r.del_flag = '0'
        `

  sql += `order by r.role_sort `

  const roles = (await sequelize.query(sql))[0]
  return roles
}

/**
 * 批量删除用户
 * @param {*} userIds 用户id数组
 */
async function deleteUserByIds(userIds) {
  let userIdStr = ''
  for (const userId of userIds) {
    checkUserAllowed(userId)
    await checkUserDataScope(userId)
    userIdStr += userId + ','
  }
  userIdStr = userIdStr.substring(0, userIdStr.length - 1)
  // 删除用户与角色关联
  await sequelize.query(`delete from sys_user_role where user_id in (${userIdStr})`)
  // 删除用户与岗位关联
  await sequelize.query(`delete from sys_user_post where user_id in (${userIdStr})`)
  // 删除用户
  await sequelize.query(`update sys_user set del_flag = '2' where user_id in (${userIdStr})`)
}

async function selectUserByVal(val) {
  const { userId } = val
  const user = (
    await sequelize.query(
      `
        select
            user_id as userId,
            dept_id as deptId,
            user_name as userName,
            nick_name as nickName,
            user_type as userType,
            email,
            phonenumber,
            sex,
            avatar,
            status,
            del_flag as delFlag,
            create_by as createBy,
            create_time as createTime,
            update_by as updateBy,
            update_time as updateTime,
            remark
        from
            sys_user su
        where
            user_id = ${userId}
        `,
    )
  )[0][0]

  const dept = (
    await sequelize.query(
      `
        select
            d.dept_id as deptId,parent_id as parentId,ancestors ,
            dept_name as deptName,order_num as orderNum,leader,
            phone,d.email ,d.status ,d.del_flag as delFlag,
            d.create_by as createBy,d.create_time as createTime,
            d.update_by as updateBy,d.update_time as updateTime
        from
            sys_user u
        left join sys_dept d on
            u.dept_id = d.dept_id
        where
            u.user_id = ${userId}
        `,
    )
  )[0][0]

  const roles = (
    await sequelize.query(
      `
        select
            r.role_id as roleId, role_name as roleName, role_key as roleKey, role_sort as roleSort, data_scope as dataScope,menu_check_strictly as menuCheckStrictly,
            dept_check_strictly as deptCheckStrictly, r.status, r.del_flag as delFlag, r.create_by as createBy, r.create_time as createTime,
            r.update_by as updateBy, r.update_time as updateTime, r.remark, false as flag, case when r.role_id = 1 then true else false end as admin
        from
            sys_user u
        left join sys_user_role ur on
            u.user_id = ur.user_id
        left join sys_role r on
            r.role_id = ur.role_id
        where
            u.user_id = ${userId}
        `,
    )
  )[0]

  user.dept = dept
  roles.map((item) => {
    item.menuCheckStrictly = Boolean(item.menuCheckStrictly)
    item.deptCheckStrictly = Boolean(item.deptCheckStrictly)
  })
  user.roles = roles
  return user
}

async function selectRolesByUserId(userId) {
  const userRoles = (
    await sequelize.query(
      `
        select distinct r.role_id, r.role_name, r.role_key, r.role_sort,
            r.data_scope, r.menu_check_strictly, r.dept_check_strictly,
            r.status, r.del_flag, r.create_time, r.remark
        from sys_role r
        left join sys_user_role ur on ur.role_id = r.role_id
        left join sys_user u on u.user_id = ur.user_id
        left join sys_dept d on u.dept_id = d.dept_id
        WHERE r.del_flag = '0' and ur.user_id = ${userId}
        `,
    )
  )[0]

  const roles = await selectRoleList()

  for (const role of roles) {
    for (const userRole of userRoles) {
      if (role.roleId === userRole.role_id) {
        role.flag = true
        break
      }
    }
  }
  return roles
}

/**
 * 查询部门管理数据
 * @param {*} dept 部门信息
 * @returns 部门信息集合
 */
async function selectDeptList(dept) {
  let sql = `
        select
            d.dept_id as id, d.parent_id as parentId, d.dept_name as label
        from sys_dept d
        where d.del_flag = '0'
        `
  if (!isEmpty(dept?.deptId)) sql += `and dept_id = ${dept.deptId} `
  if (!isEmpty(dept?.parentId)) sql += `and parent_id = ${dept.parentId} `
  if (!isEmpty(dept?.deptName)) sql += `and dept_name like concat('%', ${dept.deptId} ,'%') `
  if (!isEmpty(dept?.status)) sql += `and status = ${dept.status} `
  sql += `order by d.parent_id, d.order_num `

  const deptList = (await sequelize.query(sql))[0]
  return deptList
}

async function buildDeptTreeSelect(dept) {
  let final = []
  const depts = await selectDeptList(dept)
  const tempList = []
  for (const d of depts) {
    tempList.push(d.id)
  }

  for (const dept of depts) {
    // 如果是顶级节点, 遍历该父节点的所有子节点
    if (!tempList.includes(dept.parentId)) {
      const one = recursionFn(depts, dept)
      final.push(one)
    }
  }

  if (isEmpty(final)) final = depts

  return final
}

/**
 * 权限判断
 * @param {*} id
 */
function checkUserAllowed(id) {
  if (!isEmpty(id) && id === 1) throw new Error('不允许操作超级管理员用户')
}
/**
 * 个人中心
 */
async function profile(user) {
  const { dept, roles } = user
  delete user.dept
  delete user.roles
  const dept_ = dept.reverse()
  const dept__ = dept_.pop()
  console.log(dept_)
  user.createTime = formatDate(user.createTime)
  user['dept'] = {
    deptName: dept_.map((item) => item.deptName).join('/'),
  }
  const roleGroup = roles.map((item) => item.roleName).join()
  const postGroup = dept__.deptName

  return {
    data: user,
    roleGroup,
    postGroup,
  }
}
/**
 * 个人中心修改
 */
async function profileEdit(user) {
  const { nickName, email, phonenumber, sex, userId } = user
  await sys_user.update(
    {
      nick_name: nickName,
      email: email,
      phonenumber: phonenumber,
      sex: sex,
    },
    {
      where: {
        user_id: userId,
      },
    },
  )
}
/**
 * 修改密码
 */
async function changePwd(user) {
  const { old_pwd, new_pwd, user_id } = user
  const pwd = await sys_user.findOne({
    attributes: ['password'],
    where: {
      user_id,
    },
    raw: true,
  })
  //比较旧密码
  if (!pwd) throw new Error('请校验用户')
  const isMath = await comparePassword(old_pwd, pwd.password)
  if (!isMath) throw new Error('旧密码不正确')
  const pwd_hash = await hashPassword(new_pwd)
  await sys_user.update(
    {
      password: pwd_hash,
    },
    {
      where: {
        user_id,
      },
    },
  )
}
module.exports = {
  searchUserList,
  checkUserInfo,
  insertUser,
  checkUserDataScope,
  selectRoleList,
  deleteUserByIds,
  insertUserRole,
  insertUserPost,
  checkUserAllowed,
  selectUserByVal,
  selectRolesByUserId,
  buildDeptTreeSelect,
  profileEdit,
  changePwd,
  profile,
}
