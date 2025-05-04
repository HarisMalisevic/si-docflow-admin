import { Router } from "express";
import ProcessingRuleDestinationController from "../controllers/processingRuleDestination.controller";
import AuthMiddleware from "../middleware/AuthMiddleware";

const router = Router();


router.get(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAll
);

router.get(
    "/document-type/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByDocumentTypeId
);

router.get(
    "/api/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByApiId
);
router.get(
    "/ftp/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByFtpId
);
router.get(
    "/local/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByLocalFolderId
);

router.post(
    "/",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.create
);

router.put(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.update
);

router.delete(
    "/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.delete
);

export default router;
