import { Router } from "express";
import RemoteInitatorController from "./RemoteInitiator.controller";

const router = Router();

router.get(
    "/",
    RemoteInitatorController.getRemoteInitiatorKey
);

router.post(
    "/validate",
    RemoteInitatorController.validateRemoteInitiatorKey
);

router.get("/keys", RemoteInitatorController.getAll)

export default router;