const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_user_role.init(sequelize, DataTypes)
}

class sys_user_role extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '用户ID',
        },
        role_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '角色ID',
        },
      },
      {
        sequelize,
        tableName: 'sys_user_role',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_id' }, { name: 'role_id' }],
          },
        ],
      },
    )
  }
}
