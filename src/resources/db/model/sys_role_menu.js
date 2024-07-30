const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_role_menu.init(sequelize, DataTypes)
}

class sys_role_menu extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        role_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '角色ID',
        },
        menu_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '菜单ID',
        },
      },
      {
        sequelize,
        tableName: 'sys_role_menu',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'role_id' }, { name: 'menu_id' }],
          },
        ],
      },
    )
  }
}
