import express, { Request, Response } from "express";
import documentTypeRoutes from "../routes/documentType.routes";
import authRoutes from '../routes/auth.routes';
import ssoProvidersRoutes from '../routes/ssoProviders.routes';
import documentLayoutRoutes from '../routes/documentLayout.routes';
import accessRights from "../routes/accessRights.routes";
import apiEndpoints from "../routes/apiEndpoints.routes";
import ftpEndpoints from "../routes/ftpEndpoints.routes";
import localStorageFolder from "../routes/localStorageFolders.routes";
import AuthMiddleware from "../middleware/AuthMiddleware";
import processingRuleDestinationRoutes from "../routes/processingRuleDestination.routes";
import processingRuleRoutes from "../routes/processingRule.routes";
import remoteInitiatorRoutes from "../routes/remoteInitiator.routes";
import path from 'path';

// Define the path to the frontend build folder
const FRONTEND_BUILD_PATH = path.join(__dirname, "../../../frontend/build");

const API_ROUTER = express.Router();

// Example API routes
API_ROUTER.get(
    "/hello",
    (req: Request, res: Response) => {
        res.json({ message: "Hello from API!", requestUrl: req.url });
    }
);

API_ROUTER.get(
    "/api/message",
    AuthMiddleware.isLoggedIn,
    AuthMiddleware.isSuperAdmin,
    (req, res) => {
        const cookies = req.headers.cookie;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const jwtCookie = cookies?.split("; ").find(cookie => cookie.startsWith("jwt="))?.split("=")[1];

        res.json({ message: "Hello from backend!" });
    }
);

// Serve React frontend
API_ROUTER.use(express.static(FRONTEND_BUILD_PATH));

API_ROUTER.get(
    "/",
    (req, res) => {
        res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
    }
);

// Auth Routes
API_ROUTER.use(
    "/auth",
    authRoutes
);

// Route to check if the user is logged in
API_ROUTER.get(
    "/api/auth/status",
    AuthMiddleware.isLoggedIn,
    (req, res) => {

        res.json({ loggedIn: true, user: req.user });
    }
);

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
API_ROUTER.use(
    "/api/document-types",
    documentTypeRoutes
);

API_ROUTER.use(
    "/api/sso-providers",
    ssoProvidersRoutes
);

API_ROUTER.use(
    "/api/document-layouts",
    documentLayoutRoutes
);

API_ROUTER.use(
    "/api/access-rights",
    accessRights
);

API_ROUTER.use(
    "/api/processing-rules/destinations",
    processingRuleDestinationRoutes
);
API_ROUTER.use(
    "/api/processing-rules",
    processingRuleRoutes
);


API_ROUTER.use(
    "/api/api-endpoints",
    apiEndpoints
);

API_ROUTER.use(
    "/api/ftp-endpoints",
    ftpEndpoints
);

API_ROUTER.use(
    "/api/local-storage-folder",
    localStorageFolder
);

// Remote Initiator Routes
API_ROUTER.use(
    "/api/auth/key",
    remoteInitiatorRoutes
);


// Serve React frontend for any unknown routes - THIS MUST BE LAST IN THE FILE
API_ROUTER.get(
    "*",
    (req, res) => {
        res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
    }
);

export default API_ROUTER;