import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for DocumentLayout
interface AccessRightAttributes {
  id: number;
  token: string;
  is_active: boolean;
  name: string;
  description: string;
  created_by: number;
  updated_by: number | null;
}

// Define the creation attributes (optional fields during creation)
type AccessRightCreationAttributes = Optional<AccessRightAttributes, "id">

// Extend the Sequelize Model
class AccessRight
  extends Model<AccessRightAttributes, AccessRightCreationAttributes>
  implements AccessRightAttributes
{
  public id!: number;
  public token!: string;
  public is_active!: boolean;
  public name!: string;
  public description!: string;
  public created_by!: number;
  public updated_by!: number;
}

// Initialize the model
export function initAccessRight(sequelize: Sequelize): typeof AccessRight {
    AccessRight.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: "AccessRight",
            tableName: "access_rights",
            freezeTableName: true,
        }
    );

    return AccessRight;
}

export default AccessRight;