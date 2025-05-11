import { Router } from "express";
import { handleCreateRequest, handleGetRequests, handleGetRequestById, handleUpdateRequest, handleDeleteRequest } from "../controllers/request.controller";
import { isAuthenticated } from "../middlewares/auth"; 

const router = Router();

router.post("/", isAuthenticated , handleCreateRequest);
router.get("/", isAuthenticated, handleGetRequests);
router.get("/:id", isAuthenticated, handleGetRequestById);
router.put("/:id", isAuthenticated , handleUpdateRequest);
router.delete("/:id", isAuthenticated, handleDeleteRequest);




export default router;
