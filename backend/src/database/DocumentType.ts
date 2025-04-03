import { allowedNodeEnvironmentFlags } from 'process';
import Sequelize from 'sequelize';
import { deserialize } from 'v8';

module.exports = function (sequelize: any, DataTypes: any) {
    const DocumentType = sequelize.define("document_types", {
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
        {
            freezeTableName: true
        })
    return DocumentType;
};