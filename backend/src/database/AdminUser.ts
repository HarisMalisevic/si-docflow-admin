import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface AdminUserAttributes {
    id: number;
    email: string;
    password?: string;
    oauth_provider?: number;
    oauth_id?: string;
    access_token?: string;
    is_super_admin: boolean;
}

type AdminUserCreationAttributes = Optional<AdminUserAttributes, "id">

class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
    public id!: number;
    public email!: string;
    public password?: string;
    public oauth_provider?: number;
    public oauth_id?: string;
    public access_token?: string;
    public is_super_admin!: boolean;
}

export default function (sequelize: Sequelize) {
    AdminUser.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            oauth_provider: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            oauth_id: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            access_token: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_super_admin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "AdminUser",
            tableName: "admin_users",
            freezeTableName: true,
        }
    );

    return AdminUser;
}

export { AdminUser }