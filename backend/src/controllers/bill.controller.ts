import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Req,
  } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { BillService } from '../service/billService';
  
  @Controller('bills')
  @UseGuards(JwtAuthGuard)
  export class BillController {
    constructor(private readonly billService: BillService) {}
  
    @Post()
    create(@Req() req, @Body() dto: CreateBillDto) {
      return this.billService.create(req.user.id, dto);
    }
  
    @Get()
    findAll(@Req() req) {
      return this.billService.findAll(req.user.id);
    }
  
    @Get(':id')
    findOne(@Req() req, @Param('id') id: string) {
      return this.billService.findOne(req.user.id, id);
    }
  
    @Patch(':id')
    update(@Req() req, @Param('id') id: string, @Body() dto: UpdateBillDto) {
      return this.billService.update(req.user.id, id, dto);
    }
  
    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
      return this.billService.remove(req.user.id, id);
    }
  }
  