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
    "/destinations/document-type/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByDocumentTypeId
);

router.get(
    "/destination/api/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByApiId
);
router.get(
    "/destination/ftp/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByFtpId
);
router.get(
    "/destination/local/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.getAllByLocalFolderId
);

router.post(
    "/destination",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.create
);

router.put(
    "/destination/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.update
);

router.delete(
    "/destination/:id",
    AuthMiddleware.isLoggedIn,
    ProcessingRuleDestinationController.delete
);

export default router;
