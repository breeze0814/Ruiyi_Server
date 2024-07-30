const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_dict_data.init(sequelize, DataTypes)
}

class sys_dict_data extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        dict_code: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '字典编码',
        },
        dict_sort: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '字典排序',
        },
        dict_label: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '字典标签',
        },
        dict_value: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '字典键值',
        },
        dict_type: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '字典类型',
        },
        css_class: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '样式属性（其他样式扩展）',
        },
        list_class: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '表格回显样式',
        },
        is_default: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: 'N',
          comment: '是否默认（Y是 N否）',
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
        tableName: 'sys_dict_data',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'dict_code' }],
          },
        ],
      },
    )
  }
}
