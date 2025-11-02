import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransfertService } from './transfert.service';
import { CreateTransfertDTO } from './dto/create-transfert.dto';
import { UpdateTransfertDTO } from './dto/update-transfert.dto';
import { TransfertQueryDTO } from './dto/filter.dto';

@Controller('transfert')
export class TransfertController {
  constructor(private readonly transfertService: TransfertService) { }

  @Post()
  create(@Body() createTransfertDto: CreateTransfertDTO) {
    return this.transfertService.create(createTransfertDto);
  }
  @Post(':id/canceled')
  canceled(@Param('id') id: string) {
    return this.transfertService.canceled(id);
  }
  @Post(':id/process')
  process(@Param('id') id: string) {
    return this.transfertService.process(id);
  }
  @Get()
  findAll(@Query() query: TransfertQueryDTO) {
    return this.transfertService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfertService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransfertDto: UpdateTransfertDTO) {
    return this.transfertService.update(id, updateTransfertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transfertService.remove(id);
  }

}
