const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_role_dept.init(sequelize, DataTypes)
}

class sys_role_dept extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        role_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '角色ID',
        },
        dept_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '部门ID',
        },
      },
      {
        sequelize,
        tableName: 'sys_role_dept',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'role_id' }, { name: 'dept_id' }],
          },
        ],
      },
    )
  }
}
