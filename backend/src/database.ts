import { DestroyOptions, Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import DocumentType, { initDocumentType } from './modules/DocumentType/DocumentType.model';
import { initAdminUser } from './modules/AdminUser/AdminUser.model';
import { initSSOProvider } from './modules/SSOProvider/SSOProvider.model';
import DocumentLayout, { initDocumentLayout } from './modules/DocumentLayout/DocumentLayout.model';
import { initAccessRight } from './modules/AccessRight/AccessRight.model';
import { initLayoutImage } from './modules/LayoutImage/LayoutImage';
import { initExternalAPIEndpoint } from './modules/ExternalAPIEndpoint/ExternalAPIEndpoint.model';
import { initExternalFTPEndpoint } from './modules/ExternalFTPEndpoint/ExternalFTPEndpoint.model';
import { initProcessingRule } from './modules/ProcessingRule/ProcessingRule.model';
import { initLocalStorageFolder } from './modules/LocalStorageFolder/LocalStorageFolder.model';
import { initProcessingRuleDestination } from './modules/ProcessingRuleDestination/ProcessingRuleDestination.model';
import { initWindowsAppInstance } from './modules/WindowsAppInstance/WindowsAppInstance.model';
import { initRemoteInitiator } from './modules/RemoteInitiator/RemoteInitiator.model';
import { initClientLog } from './modules/ClientLog/ClientLog.model';
import { initRemoteTransaction } from './modules/RemoteTransaction/RemoteTransaction.model';
import { initApplicationLog } from './modules/ApplicationLog/ApplicationLog.model';
import { initSystemLog } from './modules/SystemLog/SystemLog.model';
import { initAIProvider } from './modules/AIProvider/AIProvider.model';
import { initProcessingRequestsBillingLog } from './modules/ProcessingRequestBillingLog/ProcessingRequestBillingLog.model';
import { initProcessingResultsTriplet } from './modules/ProcessingResultTriplet/ProcessingResultTriplet.model';
import { initUniversalDeviceInterfaceLog } from './modules/UniversalDeviceInterfaceLog/UniversalDeviceInterfaceLog.model';
import { initAvailableDevice } from './modules/AvailableDevice/AvailableDevice.model';
import { initFinalizedDocument } from './modules/FinalizedDocument/FinalizedDocument.model';

dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("Loaded .env: " + path.resolve(__dirname, "../.env"));
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
const DB: { Sequelize: typeof Sequelize; sequelize: Sequelize;[key: string]: any } = {} as any;

DB.Sequelize = Sequelize;
DB.sequelize = sequelize_obj;

// Import models
DB.document_types = initDocumentType(sequelize_obj);
DB.admin_users = initAdminUser(sequelize_obj);
DB.sso_providers = initSSOProvider(sequelize_obj);
DB.document_layouts = initDocumentLayout(sequelize_obj);
DB.access_rights = initAccessRight(sequelize_obj);
DB.layout_images = initLayoutImage(sequelize_obj);
DB.external_api_endpoints = initExternalAPIEndpoint(sequelize_obj);
DB.external_ftp_endpoints = initExternalFTPEndpoint(sequelize_obj);
DB.processing_rules = initProcessingRule(sequelize_obj);
DB.local_storage_folders = initLocalStorageFolder(sequelize_obj);
DB.processing_rule_destinations = initProcessingRuleDestination(sequelize_obj);
DB.windows_app_instances = initWindowsAppInstance(sequelize_obj);
DB.remote_initiators = initRemoteInitiator(sequelize_obj);
DB.client_logs = initClientLog(sequelize_obj);
DB.remote_transactions = initRemoteTransaction(sequelize_obj);
DB.application_logs = initApplicationLog(sequelize_obj);
DB.system_logs = initSystemLog(sequelize_obj);
DB.ai_providers = initAIProvider(sequelize_obj);
DB.processing_requests_billing_logs = initProcessingRequestsBillingLog(sequelize_obj);
DB.processing_results_triplets = initProcessingResultsTriplet(sequelize_obj);
DB.universal_device_interface_logs = initUniversalDeviceInterfaceLog(sequelize_obj);
DB.available_devices = initAvailableDevice(sequelize_obj);
DB.finalized_documents = initFinalizedDocument(sequelize_obj);

// Relacije
DB.sso_providers.hasMany(DB.admin_users, {
  foreignKey: 'sso_provider',
  onDelete: 'CASCADE',
  as: 'admin_users'
});

DB.admin_users.belongsTo(DB.sso_providers, {
  foreignKey: 'sso_provider',
  onDelete: 'SET NULL',
  as: 'sso_provider_details'
});

DB.admin_users.hasMany(DB.document_types, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'document_types'
})

DB.admin_users.hasMany(DB.access_rights, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'access_rights_created'
})

DB.admin_users.hasMany(DB.access_rights, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'access_rights_updated'
})

DB.document_layouts.hasOne(DB.document_types, {
  foreignKey: 'document_layout_id',
  onDelete: 'SET NULL',
  as: 'document_type'
});

DB.document_types.addHook('afterDestroy', async (type: DocumentType, options: DestroyOptions) => {
  const layoutId: number | undefined = type.document_layout_id;

  if (layoutId) {
    await DB.document_layouts.destroy({
      where: { id: layoutId },
      transaction: options.transaction,
      individualHooks: true   // triggers the document_layouts hook for image deletion
    });
  }
});

DB.admin_users.hasMany(DB.document_layouts, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'layouts_created'
});

DB.admin_users.hasMany(DB.document_layouts, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'layouts_updated'
});

DB.layout_images.hasOne(DB.document_layouts, {
  foreignKey: 'image_id',
  onDelete: 'CASCADE',
  as: 'layout'
});

DB.document_layouts.addHook('afterDestroy', async (layout: DocumentLayout, options: DestroyOptions) => {
  const imageId: number | undefined = layout.image_id;

  if (imageId) {
    await DB.layout_images.destroy({
      where: { id: imageId },
      transaction: options.transaction,
    });
  }
});

DB.admin_users.hasMany(DB.external_api_endpoints, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'external_api_endpoints_created'
});
DB.admin_users.hasMany(DB.external_api_endpoints, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'external_api_endpoints_updated'
});

DB.admin_users.hasMany(DB.external_ftp_endpoints, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'external_ftp_endpoints_created'
});

DB.admin_users.hasMany(DB.external_ftp_endpoints, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'external_ftp_endpoints_updated'
});

DB.admin_users.hasMany(DB.processing_rules, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'processing_rules_updated'
});

DB.admin_users.hasMany(DB.local_storage_folders, {
  foreignKey: 'updated_by',
  onDelete: 'CASCADE',
  as: 'local_storage_folders_updated'
});

// Define relationships for ProcessingRuleDestination
DB.processing_rules.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'processing_rule_id',
  onDelete: 'CASCADE',
  as: 'processing_rule_destinations',
});

DB.local_storage_folders.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'local_storage_folder_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_local_storage',
});

DB.external_api_endpoints.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'external_api_endpoint_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_api',
});

DB.external_ftp_endpoints.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'external_ftp_endpoint_id',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_ftp',
});

DB.admin_users.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'created_by',
  onDelete: 'CASCADE',
  as: 'processing_rule_destinations_created',
});

DB.admin_users.hasMany(DB.processing_rule_destinations, {
  foreignKey: 'updated_by',
  onDelete: 'SET NULL',
  as: 'processing_rule_destinations_updated',
});

DB.windows_app_instances.hasMany(DB.available_devices, {
  foreignKey: "instance_id",
  as: "availableDevices",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

DB.available_devices.belongsTo(DB.windows_app_instances, {
  foreignKey: "instance_id",
  as: "instance",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});


export default DB;