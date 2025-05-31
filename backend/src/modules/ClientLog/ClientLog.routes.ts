import { Router } from "express";
import ClientLogController from "./ClientLog.controller";

const router = Router();

router.get(
    "/",
    ClientLogController.getAll
);

router.get(
    "/latest/:n",
    ClientLogController.getLatestN
);

router.post(
    "/",
    ClientLogController.create
);

export default router;