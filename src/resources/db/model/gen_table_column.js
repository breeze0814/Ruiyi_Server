const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return gen_table_column.init(sequelize, DataTypes)
}

class gen_table_column extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        column_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '编号',
        },
        table_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
          comment: '归属表编号',
        },
        column_name: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '列名称',
        },
        column_comment: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '列描述',
        },
        column_type: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '列类型',
        },
        java_type: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'JAVA类型',
        },
        java_field: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: 'JAVA字段名',
        },
        is_pk: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否主键（1是）',
        },
        is_increment: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否自增（1是）',
        },
        is_required: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否必填（1是）',
        },
        is_insert: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否为插入字段（1是）',
        },
        is_edit: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否编辑字段（1是）',
        },
        is_list: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否列表字段（1是）',
        },
        is_query: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          comment: '是否查询字段（1是）',
        },
        query_type: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: 'EQ',
          comment: '查询方式（等于、不等于、大于、小于、范围）',
        },
        html_type: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）',
        },
        dict_type: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: '',
          comment: '字典类型',
        },
        sort: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '排序',
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
      },
      {
        sequelize,
        tableName: 'gen_table_column',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'column_id' }],
          },
        ],
      },
    )
  }
}
