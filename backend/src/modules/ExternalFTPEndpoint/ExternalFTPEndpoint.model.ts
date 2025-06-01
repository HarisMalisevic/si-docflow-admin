import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for ExternalFTPEndpoint
export interface ExternalFTPEndpointAttributes {
    id: number;
    title?: string;
    is_active: boolean;
    description?: string;
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
    path: string;
    created_by?: number;
    updated_by?: number;
}

// Define the creation attributes (optional fields during creation)
export type ExternalFTPEndpointCreationAttributes = Optional<ExternalFTPEndpointAttributes, "id">

// Extend the Sequelize Model
class ExternalFTPEndpoint extends Model<ExternalFTPEndpointAttributes, ExternalFTPEndpointCreationAttributes>
    implements ExternalFTPEndpointAttributes {
    public id!: number;
    public title?: string;
    public is_active!: boolean;
    public description?: string;
    public host!: string;
    public port!: number;
    public username!: string;
    public password!: string;
    public secure!: boolean;
    public path!: string;
    public created_by?: number;
    public updated_by?: number;
}

// Initialize the model
export function initExternalFTPEndpoint(sequelize: Sequelize): typeof ExternalFTPEndpoint {
    ExternalFTPEndpoint.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            host: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            port: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 21,
            },
            username: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: 'anonymous',
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: 'guest',
            },
            secure: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            path: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "ExternalFTPEndpoint",
            tableName: "external_ftp_endpoints",
            freezeTableName: true,
        }
    );

    return ExternalFTPEndpoint;
}

export default ExternalFTPEndpoint;