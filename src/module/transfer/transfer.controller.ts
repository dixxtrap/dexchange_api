import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDTO } from './dto/create-transfert.dto';
import { UpdateTransferDTO } from './dto/update-transfert.dto';
import { TransferQueryDTO } from './dto/filter.dto';
import { ApiBasicAuth, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { TransferDTO } from './dto/base.dto';
import { TransferResultDTO } from './dto/result.dto';

@Controller('transfert')
@ApiBasicAuth('x-api-key')
export class TransfertController {
  constructor(private readonly transfertService: TransferService) { }

  @Post()
  @ApiResponse({ type: () => TransferDTO })
  create(@Body() createTransfertDto: CreateTransferDTO) {
    return this.transfertService.create(createTransfertDto);
  }
  @Post(':id/canceled')
  @ApiResponse({ type: () => TransferDTO })

  canceled(@Param('id') id: string) {
    return this.transfertService.canceled(id);
  }
  @Post(':id/process')
  @ApiResponse({ type: () => TransferDTO })
  process(@Param('id') id: string) {
    return this.transfertService.process(id);
  }
  @Get()
  @ApiResponse({ type: () => TransferResultDTO })

  findAll(@Query() query: TransferQueryDTO) {
    return this.transfertService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfertService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransfertDto: UpdateTransferDTO) {
    return this.transfertService.update(id, updateTransfertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transfertService.remove(id);
  }

}
