import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for the SSOProvider model
interface SSOProviderAttributes {
    id: number;
    display_name: string;
    api_name: string;
    client_id: string;
    client_secret: string;
    callback_url: string;
    authorization_url: string;
    token_url: string;
}

// Define the creation attributes (optional fields for new instances)
type SSOProviderCreationAttributes = Optional<SSOProviderAttributes, "id">;

// Define the SSOProvider model class
class SSOProvider extends Model<SSOProviderAttributes, SSOProviderCreationAttributes> implements SSOProviderAttributes {
    public id!: number;
    public display_name!: string;
    public api_name!: string;
    public client_id!: string;
    public client_secret!: string;
    public callback_url!: string;
    public authorization_url!: string;
    public token_url!: string;
}

export function initSSOProvider(sequelize: Sequelize) {
    SSOProvider.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            display_name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            api_name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            client_id: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            client_secret: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            callback_url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            authorization_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            token_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "SSOProvider",
            tableName: "sso_providers",
            freezeTableName: true,
        }
    );

    return SSOProvider;
}

export default SSOProvider;