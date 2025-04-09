import { Sequelize, DataTypes } from "sequelize";

export default function (sequelize: Sequelize, dataTypes: typeof DataTypes) {
    const DocumentLayout = sequelize.define("document_layouts", {
        name: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        metadata: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        document_type: {
            type: dataTypes.INTEGER,
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
    return DocumentLayout;
}