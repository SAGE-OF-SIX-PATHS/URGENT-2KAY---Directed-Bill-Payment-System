import { Router } from "express";
import { handleCreateRequest, handleGetRequests } from "../controllers/request.controller";
import { isAuthenticated } from "../middlewares/auth"; 

const router = Router();

router.post("/", isAuthenticated , handleCreateRequest);
router.get("/", isAuthenticated, handleGetRequests);


export default router;
