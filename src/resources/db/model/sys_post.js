const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_post.init(sequelize, DataTypes)
}

class sys_post extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        post_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '岗位ID',
        },
        post_code: {
          type: DataTypes.STRING(64),
          allowNull: false,
          comment: '岗位编码',
        },
        post_name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '岗位名称',
        },
        post_sort: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: '显示顺序',
        },
        status: {
          type: DataTypes.CHAR(1),
          allowNull: false,
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
        tableName: 'sys_post',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'post_id' }],
          },
        ],
      },
    )
  }
}
