const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  return sys_dict_type.init(sequelize, DataTypes)
}

class sys_dict_type extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        dict_id: {
          autoIncrement: true,

          type: DataTypes.BIGINT,

          allowNull: false,

          primaryKey: true,

          comment: '字典主键',
        },

        dict_name: {
          type: DataTypes.STRING(100),

          allowNull: true,

          defaultValue: '',

          comment: '字典名称',
        },

        dict_type: {
          type: DataTypes.STRING(100),

          allowNull: true,

          defaultValue: '',

          comment: '字典类型',

          unique: 'dict_type',
        },

        status: {
          type: DataTypes.CHAR(1),

          allowNull: true,

          defaultValue: '0',

          comment: '状态（0正常 1停用）',
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

        tableName: 'sys_dict_type',

        timestamps: false,

        indexes: [
          {
            name: 'PRIMARY',

            unique: true,

            using: 'BTREE',

            fields: [{ name: 'dict_id' }],
          },
          {
            name: 'dict_type',

            unique: true,

            using: 'BTREE',

            fields: [{ name: 'dict_type' }],
          },
        ],
      },
    )
  }
}
