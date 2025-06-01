import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for ExternalAPIEndpoint
interface ExternalAPIEndpointAttributes {
    id: number;
    title: string;
    description?: string;
    is_active: boolean;
    method: string;
    base_url: string;
    route: string;
    params: string;
    headers: string;
    timeout: number;
    created_by?: number;
    updated_by?: number;
}

// Define the creation attributes (optional fields during creation)
type ExternalAPIEndpointCreationAttributes = Optional<ExternalAPIEndpointAttributes, "id">

// Extend the Sequelize Model
class ExternalAPIEndpoint extends Model<ExternalAPIEndpointAttributes, ExternalAPIEndpointCreationAttributes>
    implements ExternalAPIEndpointAttributes {
    public id!: number;
    public title!: string;
    public description?: string;
    public is_active!: boolean;
    public method!: string;
    public base_url!: string;
    public route!: string;
    public params!: string;
    public headers!: string;
    public timeout!: number;
    public created_by?: number;
    public updated_by?: number;
}

// Initialize the model
export function initExternalAPIEndpoint(sequelize: Sequelize): typeof ExternalAPIEndpoint {
    ExternalAPIEndpoint.init(
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
            method: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            base_url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            route: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            params: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            headers: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            timeout: {
                type: DataTypes.INTEGER,
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
            modelName: "ExternalAPIEndpoint",
            tableName: "external_api_endpoints",
            freezeTableName: true,
        }
    );

    return ExternalAPIEndpoint;
}

export default ExternalAPIEndpoint;