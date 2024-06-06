import { Controller, Post, Body, Param, Patch, Get, UploadedFiles, UseInterceptors, BadRequestException, HttpStatus, HttpCode } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { KycRequestService } from './kyc-request.service';
import { CreateKycRequestDto } from './create-kyc-request.dto';
import { UpdateKycStatusDto } from './update-kyc-status.dto';

@Controller('kyc-requests')
export class KycRequestController {
  constructor(private readonly kycRequestService: KycRequestService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'adhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
  ]))
  async create(
    @Body() createKycRequestDto: CreateKycRequestDto,
  ) {
    return this.kycRequestService.create(createKycRequestDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param('id') id: string, @Body() updateKycStatusDto: UpdateKycStatusDto) {
    return this.kycRequestService.updateStatus(id, updateKycStatusDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async findByUserId(@Param('userId') userId: string) {
    return this.kycRequestService.findByUserId(userId);
  }
}
