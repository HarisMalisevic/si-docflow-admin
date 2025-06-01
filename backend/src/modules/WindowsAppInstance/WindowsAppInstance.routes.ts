import { Router} from "express";
import WindowsAppInstanceController from "./WindowsAppInstance.controller";
import AuthMiddleware from "../../middleware/AuthMiddleware";

const router = Router();

router.get("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getAll);
router.get("/available-devices", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getAllWithDevices)
router.get("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.getById);
router.get("/machine/:machine_id", WindowsAppInstanceController.getByMachineId);    // used by the Windows app, thus no AuthMiddleware authorization
router.post("/", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.create);
router.post("/report-available-devices/:instance_id", WindowsAppInstanceController.reportAvailableDevices); // used by the Windows app, thus no AuthMiddleware authorization
router.put("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.update);
router.delete("/:id", AuthMiddleware.isLoggedIn, WindowsAppInstanceController.delete);

export default router;