import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for the OAuthProvider model
interface OAuthProviderAttributes {
    id: number;
    name: string;
    client_id: string;
    client_secret: string;
    callback_url: string;
}

// Define the creation attributes (optional fields for new instances)
type OAuthProviderCreationAttributes = Optional<OAuthProviderAttributes, "id">;

// Define the OAuthProvider model class
class OAuthProvider extends Model<OAuthProviderAttributes, OAuthProviderCreationAttributes> implements OAuthProviderAttributes {
    public id!: number;
    public name!: string;
    public client_id!: string;
    public client_secret!: string;
    public callback_url!: string;
}

export function initOAuthProvider(sequelize: Sequelize) {
    OAuthProvider.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
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
        },
        {
            sequelize,
            modelName: "OAuthProvider",
            tableName: "oauth_providers",
            freezeTableName: true,
        }
    );

    return OAuthProvider;
}

export default OAuthProvider;