import { Sequelize, DataTypes, Model, Optional, ForeignKey } from "sequelize";
import WindowsAppInstance from "./WindowsAppInstance";

// Define the attributes for the HeadlessDevice model
interface HeadlessDeviceAttributes {
    id: number;
    instance_id: number;
    device_name: string;
    is_chosen: boolean;
}

// Creation attributes (id is optional)
type HeadlessDeviceCreationAttributes = Optional<HeadlessDeviceAttributes, "id">;

// Define the HeadlessDevice model class
class HeadlessDevice extends Model<HeadlessDeviceAttributes, HeadlessDeviceCreationAttributes>
    implements HeadlessDeviceAttributes {
    public id!: number;
    public instance_id!: ForeignKey<WindowsAppInstance["id"]>;
    public device_name!: string;
    public is_chosen!: boolean;
}

export function initHeadlessDevice(sequelize: Sequelize) {
    HeadlessDevice.init(
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
            modelName: "HeadlessDevice",
            tableName: "headless_devices",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return HeadlessDevice;
}

export default HeadlessDevice;
