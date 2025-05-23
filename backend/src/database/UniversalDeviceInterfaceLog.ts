import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { SeverityLevel } from "./ApplicationLog";
import WindowsAppInstance from "./WindowsAppInstance";

// Define the attributes for the UniversalDeviceInterfaceLog model
interface UniversalDeviceInterfaceLogAttributes {
    id: number;
    level: SeverityLevel;
    source: string;
    event_id: string;
    task_category: string;
    message: string;
    app_instance_id: number;
}

// Define the creation attributes (optional fields for new instances)
export type UniversalDeviceInterfaceLogCreationAttributes = Optional<UniversalDeviceInterfaceLogAttributes, "id">;

// Define the UniversalDeviceInterfaceLog model class
class UniversalDeviceInterfaceLog extends Model<UniversalDeviceInterfaceLogAttributes, UniversalDeviceInterfaceLogCreationAttributes> implements UniversalDeviceInterfaceLogAttributes {
    public id!: number;
    public level!: SeverityLevel;
    public source!: string;
    public event_id!: string;
    public task_category!: string;
    public message!: string;
    public app_instance_id!: ForeignKey<WindowsAppInstance["id"]>;
}

export function initUniversalDeviceInterfaceLog(sequelize: Sequelize) {
    UniversalDeviceInterfaceLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            level: {
                type: DataTypes.ENUM,
                values: Object.values(SeverityLevel),
                allowNull: false,
            },
            source: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            event_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            task_category: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            app_instance_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: WindowsAppInstance, 
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "UniversalDeviceInterfaceLog",
            tableName: "universal_device_interface_logs",
            freezeTableName: true,
        }
    );

    return UniversalDeviceInterfaceLog;
}

export default UniversalDeviceInterfaceLog;