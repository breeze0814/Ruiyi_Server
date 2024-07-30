const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_user.init(sequelize, DataTypes)
}

class sys_user extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        user_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '用户ID',
        },
        dept_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
          comment: '部门ID',
        },
        user_name: {
          type: DataTypes.STRING(30),
          allowNull: false,
          comment: '用户账号',
        },
        nick_name: {
          type: DataTypes.STRING(30),
          allowNull: false,
          comment: '用户昵称',
        },
        user_type: {
          type: DataTypes.STRING(2),
          allowNull: true,
          defaultValue: '00',
          comment: '用户类型（00系统用户）',
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: '',
          comment: '用户邮箱',
        },
        phonenumber: {
          type: DataTypes.STRING(11),
          allowNull: true,
          defaultValue: '',
          comment: '手机号码',
        },
        sex: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '用户性别（0男 1女 2未知）',
        },
        avatar: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '头像地址',
        },
        password: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '',
          comment: '密码',
        },
        status: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '帐号状态（0正常 1停用）',
        },
        del_flag: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '删除标志（0代表存在 2代表删除）',
        },
        login_ip: {
          type: DataTypes.STRING(128),
          allowNull: true,
          defaultValue: '',
          comment: '最后登录IP',
        },
        login_date: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '最后登录时间',
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
        tableName: 'sys_user',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_id' }],
          },
        ],
      },
    )
  }
}
