import { Sequelize, DataTypes } from "sequelize";

export default function (sequelize: Sequelize, dataTypes: typeof DataTypes) {
    const AdminUser = sequelize.define("admin_users", {
        email: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        password: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        oauth_provider: { // FK to OAuthProviders table
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        oauth_id: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        access_token: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        is_super_admin: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }

    },
        {
            freezeTableName: true
        });
    return AdminUser;
}