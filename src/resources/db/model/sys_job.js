const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_job.init(sequelize, DataTypes)
}

class sys_job extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        job_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '任务ID',
        },
        job_name: {
          type: DataTypes.STRING(64),
          allowNull: false,
          defaultValue: '',
          primaryKey: true,
          comment: '任务名称',
        },
        job_group: {
          type: DataTypes.STRING(64),
          allowNull: false,
          defaultValue: 'DEFAULT',
          primaryKey: true,
          comment: '任务组名',
        },
        invoke_target: {
          type: DataTypes.STRING(500),
          allowNull: false,
          comment: '调用目标字符串',
        },
        cron_expression: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: '',
          comment: 'cron执行表达式',
        },
        misfire_policy: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: '3',
          comment: '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
        },
        concurrent: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '1',
          comment: '是否并发执行（0允许 1禁止）',
        },
        status: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '状态（0正常 1暂停）',
        },
        create_by: {
          type: DataTypes.STRING(64),
          allowNull: true,
          defaultValue: '',
          comment: '创建者',
        },
        create_time: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '创建时间',
        },
        update_by: {
          type: DataTypes.STRING(64),
          allowNull: true,
          defaultValue: '',
          comment: '更新者',
        },
        update_time: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '更新时间',
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
          defaultValue: '',
          comment: '备注信息',
        },
      },
      {
        sequelize,
        tableName: 'sys_job',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'job_id' }, { name: 'job_name' }, { name: 'job_group' }],
          },
        ],
      },
    )
  }
}
