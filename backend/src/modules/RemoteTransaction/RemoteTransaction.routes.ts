import { Router } from "express";
import RemoteTransactionsController from "./RemoteTransaction.controller";

const router = Router();

router.get("/", RemoteTransactionsController.getAll);
router.get("/latest/:n", RemoteTransactionsController.getLatestN);
router.get("/:id", RemoteTransactionsController.getById);
router.post("/", RemoteTransactionsController.create);
router.put("/status/:id", RemoteTransactionsController.updateStatus);
router.delete("/:id", RemoteTransactionsController.delete);

export default router;