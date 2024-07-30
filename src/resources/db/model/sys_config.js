const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_config.init(sequelize, DataTypes)
}

class sys_config extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        config_id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          comment: '参数主键',
        },
        config_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '参数名称',
        },
        config_key: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '参数键名',
        },
        config_value: {
          type: DataTypes.STRING(500),
          allowNull: true,
          defaultValue: '',
          comment: '参数键值',
        },
        config_type: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: 'N',
          comment: '系统内置（Y是 N否）',
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
          comment: '备注',
        },
      },
      {
        sequelize,
        tableName: 'sys_config',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'config_id' }],
          },
        ],
      },
    )
  }
}
