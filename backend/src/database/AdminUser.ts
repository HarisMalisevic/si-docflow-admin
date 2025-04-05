import { Sequelize, DataTypes } from "sequelize";

export default function (sequelize: Sequelize, dataTypes: typeof DataTypes) {
    const AdminUser = sequelize.define("document_types", {
        email: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        password: {
            type: dataTypes.TEXT,
            allowNull: false,
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
        }

    },
        {
            freezeTableName: true
        });
    return AdminUser;
}