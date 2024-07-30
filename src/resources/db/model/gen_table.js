const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return gen_table.init(sequelize, DataTypes)
}

class gen_table extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        table_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '编号',
        },
        table_name: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: '',
          comment: '表名称',
        },
        table_comment: {
          type: DataTypes.STRING(500),
          allowNull: true,
          defaultValue: '',
          comment: '表描述',
        },
        sub_table_name: {
          type: DataTypes.STRING(64),
          allowNull: true,
          comment: '关联子表的表名',
        },
        sub_table_fk_name: {
          type: DataTypes.STRING(64),
          allowNull: true,
          comment: '子表关联的外键名',
        },
        class_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '实体类名称',
        },
        tpl_category: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: 'crud',
          comment: '使用的模板（crud单表操作 tree树表操作）',
        },
        package_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '生成包路径',
        },
        module_name: {
          type: DataTypes.STRING(30),
          allowNull: true,
          comment: '生成模块名',
        },
        business_name: {
          type: DataTypes.STRING(30),
          allowNull: true,
          comment: '生成业务名',
        },
        function_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '生成功能名',
        },
        function_author: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '生成功能作者',
        },
        gen_type: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '生成代码方式（0zip压缩包 1自定义路径）',
        },
        gen_path: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: '/',
          comment: '生成路径（不填默认项目路径）',
        },
        options: {
          type: DataTypes.STRING(1000),
          allowNull: true,
          comment: '其它生成选项',
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
        tableName: 'gen_table',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'table_id' }],
          },
        ],
      },
    )
  }
}
