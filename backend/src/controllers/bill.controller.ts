import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  NotFoundException,
  Query,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Request as ExpressRequest } from "express";
import { Injectable, NestMiddleware } from '@nestjs/common';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include a user object with an id property
declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      role?: string; // Add role property
      email?: string; // Add email property
    };
  }
}
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { BillService } from '../service/billService';
import { prisma } from '../lib/prisma';
import { providers } from '../config/provider';
import { PrismaService } from '../service/prisma.service'; // Adjust the path as needed
import { CreateProviderDto } from '../dto/CreatProviderDto'; // Adjust the path as needed
import axios from 'axios';
import { initializeTransaction } from '../utils/payment.util';

// Removed the incorrect import as CustomRequest is already defined in this file

export interface CustomRequest extends ExpressRequest {
    user?: {
        id: string;
        role?: string; // Add role property
    };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as { id: string, role: string }; // Add role property
      req.user = { id: decoded.id, role: decoded.role }; // Add role property
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService, private readonly prisma: PrismaService) {}

  // Helper method to extract user ID from the request
  private getUserId(req: Request): string {
    return req.user?.id || 'default-user-id';
  }

  // Create a new bill
  @Post()
  async createBill(@Req() req: Request, @Body() dto: CreateBillDto) {
    const userId = this.getUserId(req);

    // Validate that the provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${dto.providerId} not found`);
    }

    try {
      const bill = await this.prisma.bill.create({
        data: {
          ...dto,
          userId,
          paymentStatus: 'PENDING', // Add the required paymentStatus field with a default value
        },
      });

      // Optionally, create a request for the benefactor
      const request = await this.prisma.request.create({
        data: {
          billId: bill.id,
          benefactorId: dto.benefactorId,
          status: 'PENDING',
        },
      });

      return { message: 'Bill created and request sent', bill, request };
    } catch (error) {
      console.error('Error creating bill:', error);
      throw new BadRequestException('Failed to create bill');
    }
  }

  // Retrieve bills based on user role
  @Get()
  async getBills(@Req() req: Request) {
    const userId = this.getUserId(req);
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (userRole === 'BENEFACTEE') {
      // Benefactee: Retrieve bills they created
      const bills = await this.prisma.bill.findMany({
        where: { userId },
        include: { request: true },
      });

      return { message: 'Bills created by you', bills };
    } else if (userRole === 'BENEFACTOR') {
      // Benefactor: Retrieve bills requested for them
      const requests = await this.prisma.request.findMany({
        where: { benefactorId: userId },
        include: { bill: true },
      });

      const bills = requests.map((request) => ({
        ...request.bill,
        requestStatus: request.notes, // Replace 'notes' with an appropriate property if 'status' is not available
      }));

      return { message: 'Bills requested for you', bills };
    }

    throw new BadRequestException('Invalid user role');
  }

  // Retrieve a single bill by ID
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserId(req);

    try {
      const bill = await this.billService.findOne(userId, id);
      if (!bill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }
      return bill;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw new NotFoundException('Failed to fetch bill');
    }
  }

  // Update a bill
  @Patch(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateBillDto) {
    const userId = this.getUserId(req);

    try {
      const updatedBill = await this.billService.update(userId, id, dto);
      if (!updatedBill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }
      return { message: 'Bill updated successfully', updatedBill };
    } catch (error) {
      console.error('Error updating bill:', error);
      throw new BadRequestException('Failed to update bill');
    }
  }

  // Delete a bill
  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserId(req);

    try {
      const deletedBill = await this.billService.delete(id);
      if (!deletedBill) {
        throw new NotFoundException(`Bill with ID ${id} not found`);
      }
      return { message: `Bill with ID ${id} deleted successfully`, deletedBill };
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw new BadRequestException('Failed to delete bill');
    }
  }

  // Retrieve all bills for a benefactor
  @Get('/benefactor')
  async getBenefactorBills(@Req() req: Request) {
    const userId = this.getUserId(req);

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const requests = await this.prisma.request.findMany({
      where: { benefactorId: userId },
      include: { bill: true },
    });

    const bills = requests.map((request) => request.bill);

    return { message: 'Bills for benefactor', bills };
  }

  // Verify payment for a bill
  @Post(':id/verify-payment')
  async verifyPayment(@Param('id') id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      select: { id: true, isPaid: true, metadata: true }, // Ensure 'metadata' is selected
    });

    const reference = bill?.metadata?.find((meta) => meta.key === 'reference')?.value; // Extract reference from metadata array
    if (!reference) {
      throw new NotFoundException('Reference not found for this bill');
    }

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

      // Removed unused string template
      return { message: 'This bill has already been paid.' };
      // Removed unused string template

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status } = response.data.data;

    if (status === 'success') {
      await this.prisma.bill.update({
        where: { id },
        data: { isPaid: true, paymentStatus: 'PAID' },
      });

      return { message: 'Payment verified and bill marked as paid.' };
    } else {
      return { message: 'Payment verification failed.' };
    }
  }

  // Pay a bill
  @Post(':id/pay')
  async payBill(@Param('id') id: string, @Req() req: Request) {
    const userId = this.getUserId(req);

    const request = await this.prisma.request.findFirst({
      where: { billId: id, benefactorId: userId, status: 'PENDING' },
    });

    if (!request) {
      throw new NotFoundException('No pending request found for this bill');
    }

    const bill = await this.prisma.bill.findUnique({ where: { id } });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    if (bill.isPaid) {
      return { message: 'This bill has already been paid.' };
    }

    const { authorization_url, reference } = await initializeTransaction({
      email: req.user?.email || 'default@user.com',
      amount: bill.amount,
    });

    await this.prisma.request.update({
      where: { id: request.id },
      data: { status: 'APPROVED' },
    });

    await this.prisma.bill.update({
      where: { id },
      data: { 
        paymentStatus: 'PENDING', 
        metadata: { create: [{ key: 'reference', value: reference }] } 
      },
    });

    return { message: 'Payment initialized', authorizationUrl: authorization_url };
  }

  // Retrieve pending requests for a benefactor
  @Get('/requests')
  async getRequests(@Req() req: Request) {
    const userId = this.getUserId(req);

    const requests = await this.prisma.request.findMany({
      where: { benefactorId: userId, status: 'PENDING' },
      include: { bill: true },
    });

    return { message: 'Pending requests', requests };
  }
}

// Removed redundant import of CustomRequest as it is already declared locally in this file

export const createBill = async (req: CustomRequest, res: Response) => {
  const { name, amount, dueDate, paymentStatus } = req.body;

  try {
    const bill = await prisma.bill.create({
      data: {
        amount,
        dueDate,
        paymentStatus,
        userId: req.user?.id ?? 'default-user-id',
        description: req.body.description ?? 'Default description', // Provide a default or dynamic value
        providerId: req.body.providerId ?? 'default-provider-id', // Provide a default or dynamic value
      },
    });

    res.status(201).json(bill);
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Failed to create bill" });
  }
};

export const getBills = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const bills = await prisma.bill.findMany({
      where: { userId: req.user?.id ?? 'default-user-id' }, // Fetch only bills for the authenticated user or use a default value
    });

    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

export const deleteBill = async (req, res) => { /* implementation */ };
export const updateBill = async (req, res) => { /* implementation */ };

@Controller('providers')
export class ProviderController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getProviders(@Query('type') type: string) {
    if (!type) {
      return { message: 'Provider type is required', providers: [] };
    }
    const providers = await this.prisma.provider.findMany({ where: { type: type } }); // Replace 'type' with the correct property name from your schema if needed
    return { message: `Providers for ${type}`, providers };
  }

  @Post()
  async createProvider(@Body() createProviderDto: CreateProviderDto) {
    return this.prisma.provider.create({ data: createProviderDto });
  }
}