import { Sequelize, DataTypes, Model, Optional, ForeignKey } from "sequelize";
import WindowsAppInstance from "../WindowsAppInstance/WindowsAppInstance.model";

// Define the attributes for the AvailableDevice model
export interface AvailableDeviceAttributes {
    id: number;
    instance_id: number;
    device_name: string;
    is_chosen: boolean;
}

// Creation attributes (id is optional)
export type AvailableDeviceCreationAttributes = Optional<AvailableDeviceAttributes, "id">;

// Update attributes
export type AvailableDeviceUpdateAttributes = Partial<
  Omit<AvailableDeviceAttributes, "id" | "instance_id">
>;

// Define the AvailableDevice model class
class AvailableDevice extends Model<AvailableDeviceAttributes, AvailableDeviceCreationAttributes>
    implements AvailableDeviceAttributes {
    public id!: number;
    public instance_id!: ForeignKey<WindowsAppInstance["id"]>;
    public device_name!: string;
    public is_chosen!: boolean;
}

export function initAvailableDevice(sequelize: Sequelize) {
    AvailableDevice.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            instance_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: WindowsAppInstance,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            device_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_chosen: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: "AvailableDevice",
            tableName: "available_devices",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return AvailableDevice;
}

export default AvailableDevice;