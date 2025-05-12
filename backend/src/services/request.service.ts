import { prisma } from "../lib/prisma"; 
import { CreateRequestDto, GetRequestsDto } from "../dto/request/Request.dto";

export const createRequest = async (dto: CreateRequestDto, requesterId: string) => {
  const { name, notes, priority = 'MEDIUM', supporterId, billIds } = dto;

  // Fetch bills and ensure they belong to the user and are not already part of a request
  const bills = await prisma.bill.findMany({
    where: {
      id: { in: billIds },
      userId: requesterId,
      requestId: null,
    },
  });

  if (bills.length !== billIds.length) {
    throw new Error("Invalid or already-requested bills");
  }

  // Create the request (bundle)
  const request = await prisma.request.create({
    data: {
      name,
      notes,
      priority,
      requesterId,
      supporterId,
      bills: {
        connect: billIds.map(id => ({ id })),
      },
    },
    include: {
      bills: true,
      supporter: true,
    },
  });

  return request;
};


export const getRequests = async (filters: GetRequestsDto) => {
  const { requesterId, supporterId } = filters;

  return prisma.request.findMany({
    where: {
      ...(requesterId && { requesterId }),
      ...(supporterId && { supporterId }),
    },
    include: {
      requester: true,
      supporter: true,
      bills: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getRequestById = async (id: string) => {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      requester: true,
      supporter: true,
      bills: {
        include: {
          provider: true,
          transactions: true,
          sponsors: true,
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  return request;
};


type UpdateRequestInput = {
  name?: string;
  notes?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  supporterId?: string | null;
  billIds?: string[]; // optional: replace all bills with these
};

export const updateRequest = async (id: string, data: UpdateRequestInput) => {
  const { billIds, ...rest } = data;

  const updateData: any = { ...rest };

  if (billIds) {
    updateData.bills = {
      set: billIds.map((billId) => ({ id: billId })),
    };
  }

  const updated = await prisma.request.update({
    where: { id },
    data: updateData,
  });

  return updated;
};


export const deleteRequest = async (id: string) => {
  return await prisma.request.delete({ where: { id } });
};


export const updateRequestStatus = async (
  requestId: string,
  supporterId: string,
  status: "APPROVED" | "REJECTED"
  ) => {
  const request = await prisma.request.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Request not found");
  if (request.supporterId !== supporterId) throw new Error("Unauthorized action");
  
  return await prisma.request.update({
  where: { id: requestId },
  data: {
  status,
  },
  });
  };

  export const getAllRequests = async (filters: any = {}) => {
    const { status, priority, supporterId } = filters;
    
    return await prisma.request.findMany({
    where: {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(supporterId && { supporterId }),
    },
    include: {
    requester: true,
    supporter: true,
    bills: true,
    },
    orderBy: {
    createdAt: "desc",
    },
    });
    };