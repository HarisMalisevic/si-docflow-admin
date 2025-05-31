import { Router } from "express";
import RemoteProcessingController from "./RemoteProcessing.controller"

const router = Router();

router.post("/process", RemoteProcessingController.receiveAndForwardProcessingCommand);
router.post("/result", RemoteProcessingController.receiveAndForwardProcessingResult);

export default router;