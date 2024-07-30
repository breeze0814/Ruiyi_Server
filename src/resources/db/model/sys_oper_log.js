const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_oper_log.init(sequelize, DataTypes)
}

class sys_oper_log extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        oper_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '日志主键',
        },
        title: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: '',
          comment: '模块标题',
        },
        business_type: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '业务类型（0其它 1新增 2修改 3删除）',
        },
        method: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '方法名称',
        },
        request_method: {
          type: DataTypes.STRING(10),
          allowNull: true,
          defaultValue: '',
          comment: '请求方式',
        },
        operator_type: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '操作类别（0其它 1后台用户 2手机端用户）',
        },
        oper_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: '',
          comment: '操作人员',
        },
        dept_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: '',
          comment: '部门名称',
        },
        oper_url: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: '',
          comment: '请求URL',
        },
        oper_ip: {
          type: DataTypes.STRING(128),
          allowNull: true,
          defaultValue: '',
          comment: '主机地址',
        },
        oper_location: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: '',
          comment: '操作地点',
        },
        oper_param: {
          type: DataTypes.STRING(2000),
          allowNull: true,
          defaultValue: '',
          comment: '请求参数',
        },
        json_result: {
          type: DataTypes.STRING(2000),
          allowNull: true,
          defaultValue: '',
          comment: '返回参数',
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '操作状态（0正常 1异常）',
        },
        error_msg: {
          type: DataTypes.STRING(2000),
          allowNull: true,
          defaultValue: '',
          comment: '错误消息',
        },
        oper_time: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '操作时间',
        },
        cost_time: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: 0,
          comment: '消耗时间',
        },
      },
      {
        sequelize,
        tableName: 'sys_oper_log',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'oper_id' }],
          },
          {
            name: 'idx_sys_oper_log_bt',
            using: 'BTREE',
            fields: [{ name: 'business_type' }],
          },
          {
            name: 'idx_sys_oper_log_s',
            using: 'BTREE',
            fields: [{ name: 'status' }],
          },
          {
            name: 'idx_sys_oper_log_ot',
            using: 'BTREE',
            fields: [{ name: 'oper_time' }],
          },
        ],
      },
    )
  }
}
