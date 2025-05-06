import { DestroyOptions, Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import DocumentType, { initDocumentType } from './DocumentType';
import { initAdminUser } from './AdminUser';
import { initSSOProvider } from './SSOProvider';
import DocumentLayout, { initDocumentLayout } from './DocumentLayout';
import { initAccessRight } from './AccessRight';
import { initLayoutImage } from './LayoutImage';
import { initExternalAPIEndpoint } from './ExternalAPIEndpoint';
import { initExternalFTPEndpoint } from './ExternalFTPEndpoint';
import { initProcessingRule } from './ProcessingRule';
import { initLocalStorageFolder } from './LocalStorageFolder';
import { initProcessingRuleDestination } from './ProcessingRuleDestination';

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
db.external_api_endpoints = initExternalAPIEndpoint(sequelize_obj);
db.external_ftp_endpoints = initExternalFTPEndpoint(sequelize_obj);
db.processing_rules = initProcessingRule(sequelize_obj);
db.local_storage_folders = initLocalStorageFolder(sequelize_obj);
db.processing_rule_destinations = initProcessingRuleDestination(sequelize_obj);


// Relacije
db.sso_providers.hasMany(db.admin_users, {
  foreignKey: 'sso_provider',
  onDelete: 'CASCADE',
  as: 'admin_users'
});

db.admin_users.belongsTo(db.sso_providers, {
  foreignKey: 'sso_provider',
  onDelete: 'SET NULL',
  as: 'sso_provider_details'
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

db.document_layouts.hasOne(db.document_types, {
  foreignKey: 'document_layout_id',
  onDelete: 'SET NULL',
  as: 'document_type'
});

db.document_types.addHook('afterDestroy', async (type: DocumentType, options: DestroyOptions) => {
  const layoutId: number | undefined = type.document_layout_id;

  if (layoutId) {
    await db.document_layouts.destroy({
      where: { id: layoutId },
      transaction: options.transaction,
      individualHooks: true   // triggers the document_layouts hook for image deletion
    });
  }
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

db.document_layouts.addHook('afterDestroy', async (layout: DocumentLayout, options: DestroyOptions) => {
  const imageId: number | undefined = layout.image_id;

  if (imageId) {
    await db.layout_images.destroy({
      where: { id: imageId },
      transaction: options.transaction,
    });
  }
});

db.admin_users.hasMany(db.external_api_endpoints, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'external_api_endpoints_created'
});
db.admin_users.hasMany(db.external_api_endpoints, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'external_api_endpoints_updated'
});

db.admin_users.hasMany(db.external_ftp_endpoints, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'external_ftp_endpoints_created'
});

db.admin_users.hasMany(db.external_ftp_endpoints, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'external_ftp_endpoints_updated'
});

db.admin_users.hasMany(db.processing_rules, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'processing_rules_updated'
});

db.admin_users.hasMany(db.local_storage_folders, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'local_storage_folders_updated'
});

// Define relationships for ProcessingRuleDestination
db.processing_rules.hasMany(db.processing_rule_destinations, {
  foreignKey: 'processing_rule_id',
  onDelete: 'CASCADE',
  as: 'processing_rule_destinations',
});

db.local_storage_folders.hasMany(db.processing_rule_destinations, {
  foreignKey: 'local_storage_folder_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_local_storage',
});

db.external_api_endpoints.hasMany(db.processing_rule_destinations, {
  foreignKey: 'external_api_endpoint_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_api',
});

db.external_ftp_endpoints.hasMany(db.processing_rule_destinations, {
  foreignKey: 'external_ftp_endpoint_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_ftp',
});

db.admin_users.hasMany(db.processing_rule_destinations, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'processing_rule_destinations_created',
});

db.admin_users.hasMany(db.processing_rule_destinations, {
  foreignKey: 'updated_by',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_updated',
});



export default db;