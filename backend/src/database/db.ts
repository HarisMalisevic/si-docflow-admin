import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import { initDocumentType } from './DocumentType';
import { initAdminUser } from './AdminUser';
import { initOAuthProvider } from './OAuthProvider';
import { initDocumentLayout } from './DocumentLayout';

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
db.document_types = initDocumentType(sequelize_obj);
db.admin_users = initAdminUser(sequelize_obj);
db.oauth_providers = initOAuthProvider(sequelize_obj);
db.document_layouts = initDocumentLayout(sequelize_obj);


// Relacije
db.oauth_providers.hasMany(db.admin_users, {
  foreignKey: 'oauth_provider',
  onDelete: 'CASCADE',
  as: 'admin_users'
});

db.admin_users.hasMany(db.document_types, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'document_types'
})

db.document_types.hasMany(db.document_layouts, {
  foreignKey: 'document_type',
  onDelete: 'CASCADE',
  as: 'document_layouts'
});

db.admin_users.hasMany(db.document_layouts, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'document_layouts'
});

export default db;