import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for DocumentLayout
interface LayoutImageAttributes {
    id: number;
    image: Blob;
    width: number;
    height: number;
}

// Define the creation attributes (optional fields during creation)
type LayoutImageCreationAttributes = Optional<LayoutImageAttributes, "id">

// Extend the Sequelize Model
class LayoutImage extends Model<LayoutImageAttributes, LayoutImageCreationAttributes>
    implements LayoutImageAttributes {
    public id!: number;
    public image!: Blob;
    public width!: number;
    public height!: number;
}

// Initialize the model
export function initLayoutImage(sequelize: Sequelize): typeof LayoutImage {
    LayoutImage.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            image: {
                type: DataTypes.BLOB,
                allowNull: false,
            },
            width: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            height: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "LayoutImage",
            tableName: "layout_images",
            freezeTableName: true,
        }
    );

    return LayoutImage;
}

export default LayoutImage;