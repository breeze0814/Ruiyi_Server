const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_user_post.init(sequelize, DataTypes)
}

class sys_user_post extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        user_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '用户ID',
        },
        post_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '岗位ID',
        },
      },
      {
        sequelize,
        tableName: 'sys_user_post',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'user_id' }, { name: 'post_id' }],
          },
        ],
      },
    )
  }
}
