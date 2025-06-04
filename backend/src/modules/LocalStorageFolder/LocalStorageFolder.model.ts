import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for the LocalStorageFolder model
interface LocalStorageFolderAttributes {
    id: number;
    title: string;
    description?: string;
    path: string;
    is_active: boolean;
    created_by: number; // Foreign key for the user who created the folder
    updated_by?: number; // Optional foreign key for the user who last updated the folder
}

// Define the creation attributes (optional fields for new instances)
type LocalStorageFolderCreationAttributes = Optional<LocalStorageFolderAttributes, "id">;

// Define the LocalStorageFolder model class
class LocalStorageFolder extends Model<LocalStorageFolderAttributes, LocalStorageFolderCreationAttributes> implements LocalStorageFolderAttributes {
    public id!: number;
    public title!: string;
    public description?: string;
    public path!: string;
    public is_active!: boolean;
    public created_by!: number;
    public updated_by?: number;
}

export function initLocalStorageFolder(sequelize: Sequelize) {
    LocalStorageFolder.init(
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
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
            modelName: "LocalStorageFolder",
            tableName: "local_storage_folders",
            timestamps: true,
        }
    );

    return LocalStorageFolder;
}

export default LocalStorageFolder;