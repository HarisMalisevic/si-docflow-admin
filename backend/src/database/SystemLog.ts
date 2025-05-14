import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { SeverityLevel } from "./ApplicationLog";
import WindowsAppInstance from "./WindowsAppInstance";

// Define the attributes for the SystemLog model
interface SystemLogAttributes {
    id: number;
    level: SeverityLevel;
    source: string;
    event_id: string;
    task_category: string;
    app_instance_id: number;
}

// Define the creation attributes (optional fields for new instances)
export type SystemLogCreationAttributes = Optional<SystemLogAttributes, "id">;

// Define the SystemLog model class
class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
    public id!: number;
    public level!: SeverityLevel;
    public source!: string;
    public event_id!: string;
    public task_category!: string;
    public app_instance_id!: ForeignKey<WindowsAppInstance["id"]>;
}

export function initSystemLog(sequelize: Sequelize) {
    SystemLog.init(
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
            modelName: "SystemLog",
            tableName: "system_logs",
            freezeTableName: true,
        }
    );

    return SystemLog;
}

export default SystemLog;