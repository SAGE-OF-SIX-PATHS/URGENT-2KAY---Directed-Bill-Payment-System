import { Router } from "express";
import { handleCreateRequest, handleGetRequests, handleGetRequestById } from "../controllers/request.controller";
import { isAuthenticated } from "../middlewares/auth"; 

const router = Router();

router.post("/", isAuthenticated , handleCreateRequest);
router.get("/", isAuthenticated, handleGetRequests);
router.get("/:id", isAuthenticated, handleGetRequestById);



export default router;
