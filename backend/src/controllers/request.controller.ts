import { Request, Response } from "express";
import * as RequestService from "../services/request.service";

export const handleCreateRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
          res.status(401).json({ success: false, message: "Unauthorized" });
          return;
        }


    const requesterId = req.user.id; 
    const dto = req.body;
    const newRequest = await RequestService.createRequest(dto, requesterId);
    res.status(201).json({ success: true, data: newRequest });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export const handleGetRequests = async (req: Request, res: Response) => {
  try {
    const filters = {
      requesterId: req.query.requesterId as string,
      supporterId: req.query.supporterId as string,
    };

    const requests = await RequestService.getRequests(filters);
    res.status(200).json({ success: true, data: requests });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const handleGetRequestById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const request = await RequestService.getRequestById(id);
    res.status(200).json({ success: true, data: request });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const handleUpdateRequest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updated = await RequestService.updateRequest(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const handleDeleteRequest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await RequestService.deleteRequest(id);
    res.status(200).json({ success: true, message: "Request deleted" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
