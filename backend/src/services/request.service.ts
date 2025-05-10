import { prisma } from "../lib/prisma"; 
import { CreateRequestDto } from "../dto/request/createRequest.dto";

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
