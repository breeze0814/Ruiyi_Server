const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  return sys_menu.init(sequelize, DataTypes)
}

class sys_menu extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        menu_id: {
          autoIncrement: true,
          type: DataTypes.BIGINT,
          allowNull: false,
          primaryKey: true,
          comment: '菜单ID',
        },
        menu_name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '菜单名称',
        },
        parent_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
          defaultValue: 0,
          comment: '父菜单ID',
        },
        order_num: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '显示顺序',
        },
        path: {
          type: DataTypes.STRING(200),
          allowNull: true,
          defaultValue: '',
          comment: '路由地址',
        },
        component: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '组件路径',
        },
        query: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '路由参数',
        },
        is_frame: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 1,
          comment: '是否为外链（0是 1否）',
        },
        is_cache: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
          comment: '是否缓存（0缓存 1不缓存）',
        },
        menu_type: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '',
          comment: '菜单类型（M目录 C菜单 F按钮）',
        },
        visible: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '菜单状态（0显示 1隐藏）',
        },
        status: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          defaultValue: '0',
          comment: '菜单状态（0正常 1停用）',
        },
        perms: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '权限标识',
        },
        icon: {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: '#',
          comment: '菜单图标',
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
          defaultValue: '',
          comment: '备注',
        },
      },
      {
        sequelize,
        tableName: 'sys_menu',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'menu_id' }],
          },
        ],
      },
    )
  }
}
