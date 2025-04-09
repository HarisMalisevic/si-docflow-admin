import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import DocumentType from './DocumentType';
import AdminUsers from './AdminUser';
import OAuthProvider from './OAuthProvider';
import DocumentLayout from './DocumentLayout';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("Loaded .env: " + path.resolve(__dirname, "../../.env"));
//console.log("Loaded environment variables:", process.env);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}
const connectionString: string = process.env.DATABASE_URL;

const sequelize_obj = new Sequelize(connectionString,
  {
    dialect: "postgres",
    logging: false,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: { Sequelize?: typeof Sequelize; sequelize?: Sequelize;[key: string]: any } = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize_obj;

// Import modela
db.document_types = DocumentType(sequelize_obj, DataTypes);
db.admin_users = AdminUsers(sequelize_obj, DataTypes);
db.oauth_providers = OAuthProvider(sequelize_obj, DataTypes);
db.document_layouts = DocumentLayout(sequelize_obj, DataTypes);


// Relacije
db.oauth_providers.hasMany(db.admin_users, {
  foreignKey: 'oauth_provider',
  onDelete: 'CASCADE',
  as: 'admin_users'
});

db.admin_users.hasMany(db.document_types, {
  foreignKey: 'admin_user_id',
  onDelete: 'CASCADE',
  as: 'document_types'
})

db.document_types.hasMany(db.document_layouts, {
  foreignKey: 'document_type',
  onDelete: 'CASCADE',
  as: 'document_layouts'
});

export default db;