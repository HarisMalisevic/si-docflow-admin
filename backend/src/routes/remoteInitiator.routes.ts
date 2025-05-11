import { Router } from "express";
import RemoteInitatorController from "../controllers/RemoteInitiatorController";

const router = Router();

router.get(
    "/",
    RemoteInitatorController.getRemoteInitiatorKey
);

router.post(
    "/validate",
    RemoteInitatorController.validateRemoteInitiatorKey
);

export default router;