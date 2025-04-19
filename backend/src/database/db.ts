import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import { initDocumentType } from './DocumentType';
import { initAdminUser } from './AdminUser';
import { initSSOProvider } from './SSOProvider';
import { initDocumentLayout } from './DocumentLayout';
import { initAccessRight } from './AccessRight';
import { initLayoutImage } from './LayoutImage';

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
db.sso_providers = initSSOProvider(sequelize_obj);
db.document_layouts = initDocumentLayout(sequelize_obj);
db.access_rights = initAccessRight(sequelize_obj);
db.layout_images = initLayoutImage(sequelize_obj);


// Relacije
db.sso_providers.hasMany(db.admin_users, {
  foreignKey: 'sso_provider',
  onDelete: 'CASCADE',
  as: 'admin_users'
});

db.admin_users.hasMany(db.document_types, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'document_types'
})

db.admin_users.hasMany(db.access_rights, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'access_rights_created'
})

db.admin_users.hasMany(db.access_rights, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'access_rights_updated'
})

db.document_types.hasMany(db.document_layouts, {
  foreignKey: 'document_type',
  onDelete: 'CASCADE',
  as: 'layouts_by_document_type'
});

db.admin_users.hasMany(db.document_layouts, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'layouts_created'
});

db.admin_users.hasMany(db.document_layouts, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'layouts_updated'
});

db.layout_images.hasOne(db.document_layouts, {
  foreignKey: 'image_id',
  onDelete: 'CASCADE',
  as: 'layout'
});

export default db;