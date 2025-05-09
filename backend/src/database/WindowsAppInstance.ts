import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the enum for operational_mode
export enum OperationalMode {
    HEADLESS = "headless",
    STANDALONE = "standalone",
}

// Define the attributes for the WindowsAppInstance model
interface WindowsAppInstanceAttributes {
    id: number;
    title: string;
    location: string;
    machine_id: string;
    operational_mode: OperationalMode; // Use the enum here
    polling_frequency: number;
    created_by?: number;
    updated_by?: number;
}

// Define the creation attributes (optional fields for new instances)
type WindowsAppInstanceCreationAttributes = Optional<WindowsAppInstanceAttributes, "id">;

// Define the WindowsAppInstance model class
class WindowsAppInstance extends Model<WindowsAppInstanceAttributes, WindowsAppInstanceCreationAttributes> implements WindowsAppInstanceAttributes {
    public id!: number;
    public title!: string;
    public location!: string;
    public machine_id!: string;
    public operational_mode!: OperationalMode; // Use the enum here
    public polling_frequency!: number;
    public created_by?: number;
    public updated_by?: number;
}

export function initWindowsAppInstance(sequelize: Sequelize) {
    WindowsAppInstance.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            machine_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            operational_mode: {
                type: DataTypes.ENUM,
                values: Object.values(OperationalMode), // Use the enum values here
                allowNull: false,
            },
            polling_frequency: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "WindowsAppInstance",
            tableName: "windows_app_instances",
            freezeTableName: true,
        }
    );

    return WindowsAppInstance;
}

export default WindowsAppInstance;