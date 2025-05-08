import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { BillService } from '../service/billService';

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  private getUserId(req: Request): string {
    return 'test-user-id';  // In production, use a real user identification method (JWT, sessions, etc.)
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateBillDto) {
    const userId = this.getUserId(req);
    return this.billService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.billService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.billService.findOne(userId, id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateBillDto) {
    const userId = this.getUserId(req);
    return this.billService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.billService.remove(userId, id);
  }
}