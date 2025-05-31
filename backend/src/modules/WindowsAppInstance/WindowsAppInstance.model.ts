import { Sequelize, DataTypes, Model, Optional, ForeignKey } from "sequelize";
import AdminUser from "../AdminUser/AdminUser.model";
import AvailableDevice from "../AvailableDevice/AvailableDevice.model";

// Define the enum for operational_mode
export enum OperationalMode {
  HEADLESS = "headless",
  STANDALONE = "standalone",
}

// Define the attributes for the WindowsAppInstance model
export interface WindowsAppInstanceAttributes {
  id: number;
  title: string;
  location: string;
  machine_id: string;
  operational_mode: OperationalMode; // Use the enum here
  polling_frequency: number;
  chosen_device_id?: number | null;
  created_by?: number;
  updated_by?: number;
}

// Define the creation attributes (optional fields for new instances)
export type WindowsAppInstanceCreationAttributes = Optional<
  WindowsAppInstanceAttributes,
  "id" | "created_by" | "updated_by" | "chosen_device_id"
>;

// Define the WindowsAppInstance model class
class WindowsAppInstance
  extends Model<
    WindowsAppInstanceAttributes,
    WindowsAppInstanceCreationAttributes
  >
  implements WindowsAppInstanceAttributes
{
  public id!: number;
  public title!: string;
  public location!: string;
  public machine_id!: string;
  public operational_mode!: OperationalMode; // Use the enum here
  public polling_frequency!: number;
  public chosen_device_id?: ForeignKey<AvailableDevice["id"]> | null;
  public created_by?: ForeignKey<AdminUser["id"]>; // Foreign key to AdminUser
  public updated_by?: ForeignKey<AdminUser["id"]>; // Foreign key to AdminUser
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
      chosen_device_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "available_devices", 
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", 
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: AdminUser, // Reference the AdminUser model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: AdminUser, // Reference the AdminUser model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
