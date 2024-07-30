const DataTypes = require('sequelize').DataTypes

const _gen_table = require('./gen_table')

const _gen_table_column = require('./gen_table_column')

const _sys_config = require('./sys_config')

const _sys_dept = require('./sys_dept')

const _sys_dict_data = require('./sys_dict_data')

const _sys_dict_type = require('./sys_dict_type')

const _sys_job = require('./sys_job')

const _sys_job_log = require('./sys_job_log')

const _sys_logininfor = require('./sys_logininfor')

const _sys_menu = require('./sys_menu')

const _sys_notice = require('./sys_notice')

const _sys_oper_log = require('./sys_oper_log')

const _sys_post = require('./sys_post')

const _sys_role = require('./sys_role')

const _sys_role_dept = require('./sys_role_dept')

const _sys_role_menu = require('./sys_role_menu')

const _sys_user = require('./sys_user')

const _sys_user_post = require('./sys_user_post')

const _sys_user_role = require('./sys_user_role')

function initModels(sequelize) {
  const gen_table = _gen_table(sequelize, DataTypes)

  const gen_table_column = _gen_table_column(sequelize, DataTypes)

  const sys_config = _sys_config(sequelize, DataTypes)

  const sys_dept = _sys_dept(sequelize, DataTypes)

  const sys_dict_data = _sys_dict_data(sequelize, DataTypes)

  const sys_dict_type = _sys_dict_type(sequelize, DataTypes)

  const sys_job = _sys_job(sequelize, DataTypes)

  const sys_job_log = _sys_job_log(sequelize, DataTypes)

  const sys_logininfor = _sys_logininfor(sequelize, DataTypes)

  const sys_menu = _sys_menu(sequelize, DataTypes)

  const sys_notice = _sys_notice(sequelize, DataTypes)

  const sys_oper_log = _sys_oper_log(sequelize, DataTypes)

  const sys_post = _sys_post(sequelize, DataTypes)

  const sys_role = _sys_role(sequelize, DataTypes)

  const sys_role_dept = _sys_role_dept(sequelize, DataTypes)

  const sys_role_menu = _sys_role_menu(sequelize, DataTypes)

  const sys_user = _sys_user(sequelize, DataTypes)

  const sys_user_post = _sys_user_post(sequelize, DataTypes)

  const sys_user_role = _sys_user_role(sequelize, DataTypes)

  return {
    gen_table,

    gen_table_column,

    sys_config,

    sys_dept,

    sys_dict_data,

    sys_dict_type,

    sys_job,

    sys_job_log,

    sys_logininfor,

    sys_menu,

    sys_notice,

    sys_oper_log,

    sys_post,

    sys_role,

    sys_role_dept,

    sys_role_menu,

    sys_user,

    sys_user_post,

    sys_user_role,
  }
}

module.exports = initModels

module.exports.initModels = initModels

module.exports.default = initModels
