import { Router } from "express";
import RemoteTransactionsController from "../controllers/remoteTransactions.controller";

const router = Router();

router.get("/", RemoteTransactionsController.getAll);
router.get("/latest/:n", RemoteTransactionsController.getLatestN);
router.post("/", RemoteTransactionsController.create);
router.put("/status/:id", RemoteTransactionsController.updateStatus);
router.delete("/:id", RemoteTransactionsController.delete);

export default router;