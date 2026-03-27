'use strict';
module.exports = (sequelize, DataTypes) => {
const users = sequelize.define('users', {
    name: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
      }    
}, {
    timestamps: false
});
users.associate = function(models) {
    users.belongsTo(models.roles, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    });
};
return users;
};