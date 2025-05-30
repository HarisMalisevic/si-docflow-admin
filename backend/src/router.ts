import express, { Request, Response } from "express";
import documentTypeRoutes from "./modules/DocumentType/DocumentType.routes";
import authRoutes from "./auth/Auth.routes";
import ssoProvidersRoutes from "./modules/SSOProvider/SSOProvider.routes";
import documentLayoutRoutes from "./modules/DocumentLayout/DocumentLayout.routes";
import accessRights from "./modules/AccessRight/AccessRight.routes";
import apiEndpoints from "./modules/ExternalAPIEndpoint/ExternalAPIEndpoint.routes";
import ftpEndpoints from "./modules/ExternalFTPEndpoint/ExternalFTPEndpoint.routes";
import localStorageFolder from "./modules/LocalStorageFolder/LocalStorageFolder.routes";
import windowsAppInstance from "./modules/WindowsAppInstance/WindowsAppInstance.routes";
import AuthMiddleware from "./middleware/AuthMiddleware";
import processingRuleDestinationRoutes from "./modules/ProcessingRuleDestination/ProcessingRuleDestination.routes";
import processingRuleRoutes from "./modules/ProcessingRule/ProcessingRule.routes";
import remoteInitiatorRoutes from "./modules/RemoteInitiator/RemoteInitiator.routes";
import clientLogRoutes from "./modules/ClientLog/ClientLog.routes";
import remoteTransactionRoutes from "./modules/RemoteTransaction/RemoteTransaction.routes";
import remoteProcessingRoutes from "./modules/RemoteProcessing/RemoteProcessing.routes";
import applicationLogsRoutes from "./modules/ApplicationLog/ApplicationLog.routes";
import systemLogsRoutes from "./modules/SystemLog/SystemLog.routes";
import aiProviderRoutes from "./modules/AIProvider/AIProvider.routes";
import universalDeviceLogsRoutes from "./modules/UniversalDeviceInterfaceLog/UniversalDeviceInterfaceLog.routes";
import ProcessingRequestsBillingLogRouter from "./modules/ProcessingRequestBillingLog/ProcessingRequestBillingLog.routes";
import path from "path";

// Define the path to the frontend build folder
const FRONTEND_BUILD_PATH = path.join(__dirname, "../../frontend/build");

const API_ROUTER = express.Router();

// Example API routes
API_ROUTER.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello from API!", requestUrl: req.url });
});

API_ROUTER.get(
  "/api/message",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  (req, res) => {
    const cookies = req.headers.cookie;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const jwtCookie = cookies
      ?.split("; ")
      .find((cookie) => cookie.startsWith("jwt="))
      ?.split("=")[1];

    res.json({ message: "Hello from backend!" });
  }
);

// Serve React frontend
API_ROUTER.use(express.static(FRONTEND_BUILD_PATH));

API_ROUTER.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

// Auth Routes
API_ROUTER.use("/auth", authRoutes);

// Route to check if the user is logged in
API_ROUTER.get("/api/auth/status", AuthMiddleware.isLoggedIn, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

// Route to check if logged in user is super admin
API_ROUTER.get(
  "/api/auth/status/super",
  AuthMiddleware.isLoggedIn,
  AuthMiddleware.isSuperAdmin,
  (req, res) => {
    console.log("User is super admin:", req.user);
    res.json({ loggedIn: true, user: req.user });
  }
);

// API Routes
API_ROUTER.use("/api/document-types", documentTypeRoutes);

API_ROUTER.use("/api/sso-providers", ssoProvidersRoutes);

API_ROUTER.use("/api/document-layouts", documentLayoutRoutes);

API_ROUTER.use("/api/access-rights", accessRights);

API_ROUTER.use("/api/processing-rules/destinations", processingRuleDestinationRoutes
);
API_ROUTER.use("/api/processing-rules", processingRuleRoutes);

API_ROUTER.use("/api/api-endpoints", apiEndpoints);

API_ROUTER.use("/api/ftp-endpoints", ftpEndpoints);

API_ROUTER.use("/api/local-storage-folder", localStorageFolder);

API_ROUTER.use("/api/windows-app-instance", windowsAppInstance);

API_ROUTER.use("/api/auth/key", remoteInitiatorRoutes);

API_ROUTER.use("/api/client-log", clientLogRoutes);  // AuthMiddleware.isLoggedIn, TODO: Skontati autorizaciju za client logging (po potrebi!)

API_ROUTER.use("/api/remote-transactions", remoteTransactionRoutes);

API_ROUTER.use("/api/remote", remoteProcessingRoutes);

API_ROUTER.use("/api/application-logs", applicationLogsRoutes);

API_ROUTER.use("/api/system-logs", systemLogsRoutes);

API_ROUTER.use("/api/ai-providers", aiProviderRoutes);

API_ROUTER.use("/api/processing-requests-billing-logs", ProcessingRequestsBillingLogRouter);

API_ROUTER.use("/api/universal-device-logs", universalDeviceLogsRoutes);

// Serve React frontend for any unknown routes - THIS MUST BE LAST IN THE FILE
API_ROUTER.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

export default API_ROUTER;
