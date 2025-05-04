import { Request, Response } from "express";
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

import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { BillService } from '../service/billService';

@Controller('bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBillDto) {
    const testUserId = 'test-user-id';
    return this.billService.create(testUserId, dto);
  }

  @Get()
  findAll(@Req() req) {
    const testUserId = 'test-user-id';
    return this.billService.findAll(testUserId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const testUserId = 'test-user-id';
    return this.billService.findOne(testUserId, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBillDto) {
    const testUserId = 'test-user-id';
    return this.billService.update(testUserId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const testUserId = 'test-user-id';
    return this.billService.remove(testUserId, id);
  }
}

