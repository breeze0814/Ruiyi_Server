const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_notice.init(sequelize, DataTypes)
}

class sys_notice extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        notice_id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          comment: '公告ID',
        },
        notice_title: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '公告标题',
        },
        notice_type: {
          type: DataTypes.CHAR(1),
          allowNull: false,
          comment: '公告类型（1通知 2公告）',
        },
        notice_content: {
          type: DataTypes.BLOB,
          allowNull: true,
          comment: '公告内容',
        },
        status: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '公告状态（0正常 1关闭）',
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
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '备注',
        },
      },
      {
        sequelize,
        tableName: 'sys_notice',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'notice_id' }],
          },
        ],
      },
    )
  }
}
