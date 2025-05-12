import { Router } from "express";
import RemoteProcessingController from "../controllers/remoteProcessing.controller"

const router = Router();

router.post("/process", RemoteProcessingController.receiveAndForwardProcessingCommand);
router.post("/result", RemoteProcessingController.receiveAndForwardProcessingResult);

export default router;