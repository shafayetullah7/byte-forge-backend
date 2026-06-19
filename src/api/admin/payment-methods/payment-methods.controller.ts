import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@/common/decorators/api-error.decorator';
import { ResponseService } from '@/common/modules/response/response.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ListPaymentMethodsQueryDto } from './dto/list-payment-methods-query.dto';
import { PaymentMethodIdParamDto } from './dto/payment-method-id-param.dto';
import { ListPaymentMethodsService } from './services/list-payment-methods.service';
import { GetPaymentMethodService } from './services/get-payment-method.service';
import { CreatePaymentMethodService } from './services/create-payment-method.service';
import { UpdatePaymentMethodService } from './services/update-payment-method.service';
import { ActivatePaymentMethodService } from './services/activate-payment-method.service';
import { DeactivatePaymentMethodService } from './services/deactivate-payment-method.service';
import { AuthenticAdminUser } from '@/common/decorators/authentic-admin.decorator';
import { AuthenticAdmin } from '@/common/types';

@ApiTags('💳 Admin - Payment Methods')
@UseGuards(AdminAuthGuard)
@ApiAuth()
@Controller('admin/payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly listPaymentMethodsService: ListPaymentMethodsService,
    private readonly getPaymentMethodService: GetPaymentMethodService,
    private readonly createPaymentMethodService: CreatePaymentMethodService,
    private readonly updatePaymentMethodService: UpdatePaymentMethodService,
    private readonly activatePaymentMethodService: ActivatePaymentMethodService,
    private readonly deactivatePaymentMethodService: DeactivatePaymentMethodService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'List platform payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved' })
  @Get()
  async findAll(@Query() query: ListPaymentMethodsQueryDto) {
    const data = await this.listPaymentMethodsService.execute(query);
    return this.responseService.success({
      data,
      message: 'Payment methods retrieved successfully',
    });
  }

  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method retrieved' })
  @ApiNotFoundResponse('Payment method')
  @Get(':id')
  async findOne(@Param() param: PaymentMethodIdParamDto) {
    const data = await this.getPaymentMethodService.execute(param.id);
    return this.responseService.success({
      data,
      message: 'Payment method retrieved successfully',
    });
  }

  @ApiOperation({ summary: 'Register a platform payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created' })
  @ApiBadRequestResponse()
  @Post()
  async create(
    @Body() dto: CreatePaymentMethodDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.createPaymentMethodService.execute(
      dto,
      admin.admin.id,
    );
    return this.responseService.success({
      data,
      message: 'Payment method created successfully',
    });
  }

  @ApiOperation({ summary: 'Update payment method display fields' })
  @ApiResponse({ status: 200, description: 'Payment method updated' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse('Payment method')
  @Patch(':id')
  async update(
    @Param() param: PaymentMethodIdParamDto,
    @Body() dto: UpdatePaymentMethodDto,
    @AuthenticAdminUser() admin: AuthenticAdmin,
  ) {
    const data = await this.updatePaymentMethodService.execute(
      param.id,
      dto,
      admin.admin.id,
    );
    return this.responseService.success({
      data,
      message: 'Payment method updated successfully',
    });
  }

  @ApiOperation({ summary: 'Activate payment method for checkout' })
  @ApiResponse({ status: 200, description: 'Payment method activated' })
  @ApiNotFoundResponse('Payment method')
  @Patch(':id/activate')
  async activate(@Param() param: PaymentMethodIdParamDto) {
    const data = await this.activatePaymentMethodService.execute(param.id);
    return this.responseService.success({
      data,
      message: 'Payment method activated successfully',
    });
  }

  @ApiOperation({ summary: 'Deactivate payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deactivated' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse('Payment method')
  @Patch(':id/deactivate')
  async deactivate(@Param() param: PaymentMethodIdParamDto) {
    const data = await this.deactivatePaymentMethodService.execute(param.id);
    return this.responseService.success({
      data,
      message: 'Payment method deactivated successfully',
    });
  }
}
