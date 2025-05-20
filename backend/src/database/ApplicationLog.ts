import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import WindowsAppInstance from "./WindowsAppInstance";

// Define the enum for SeverityLevel
export enum SeverityLevel {
    INFORMATION = "Information",
    WARNING = "Warning",
    ERROR = "Error",
    CRITICAL = "Critical",
    VERBOSE = "Verbose",
}

// Define the attributes for the ApplicationLog model
interface ApplicationLogAttributes {
    id: number;
    level: SeverityLevel;
    source: string;
    event_id: string;
    task_category: string;
    app_instance_id: number;
}

// Define the creation attributes (optional fields for new instances)
export type ApplicationLogCreationAttributes = Optional<ApplicationLogAttributes, "id">;

// Define the ApplicationLog model class
class ApplicationLog extends Model<ApplicationLogAttributes, ApplicationLogCreationAttributes> implements ApplicationLogAttributes {
    public id!: number;
    public level!: SeverityLevel;
    public source!: string;
    public event_id!: string;
    public task_category!: string;
    public app_instance_id!: ForeignKey<WindowsAppInstance["id"]>;
}

export function initApplicationLog(sequelize: Sequelize) {
    ApplicationLog.init(
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
            modelName: "ApplicationLog",
            tableName: "application_logs",
            freezeTableName: true,
        }
    );

    return ApplicationLog;
}

export default ApplicationLog;