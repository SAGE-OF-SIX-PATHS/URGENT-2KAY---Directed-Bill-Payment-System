import { Router } from "express";
import { handleCreateRequest, handleGetRequests, handleGetRequestById, 
    handleUpdateRequest, handleDeleteRequest,handleUpdateRequestStatus,
    handleGetAllRequests} from "../controllers/request.controller";
import { isAuthenticated } from "../middlewares/auth"; 

const router = Router();

router.post("/", isAuthenticated , handleCreateRequest);
router.get("/", isAuthenticated, handleGetRequests);
router.get("/:id", isAuthenticated, handleGetRequestById);
router.put("/:id", isAuthenticated , handleUpdateRequest);
router.delete("/:id", isAuthenticated, handleDeleteRequest);
router.patch("/:id/status", isAuthenticated, handleUpdateRequestStatus);
router.get("/", isAuthenticated , handleGetAllRequests);




export default router;
