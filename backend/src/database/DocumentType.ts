import { Sequelize, DataTypes } from "sequelize";

export default function (sequelize: Sequelize, dataTypes: typeof DataTypes) {
    const DocumentType = sequelize.define("document_types", {
        name: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: dataTypes.INTEGER,
            allowNull: true,
        }
    },
        {
            freezeTableName: true
        });
    return DocumentType;
}