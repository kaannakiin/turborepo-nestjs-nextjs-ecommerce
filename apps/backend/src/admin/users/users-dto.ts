import { createZodDto } from 'nestjs-zod';
import {
  AdminUserDeleteBulkActionSchema,
  AdminUserUpdateGroupBulkActionSchema,
  AdminUserUpdateRoleBulkActionSchema,
  ManualGroupSchema,
  SmartGroupSchema,
} from '@repo/types';

export class CustomerSmartGroupDto extends createZodDto(SmartGroupSchema) {}
export class CustomerManualGroupDto extends createZodDto(ManualGroupSchema) {}

export type CustomerGroupDto = CustomerManualGroupDto | CustomerSmartGroupDto;

export class AdminUserDeleteBulkActionDto extends createZodDto(
  AdminUserDeleteBulkActionSchema,
) {}

export class AdminUserUpdateGroupBulkActionDto extends createZodDto(
  AdminUserUpdateGroupBulkActionSchema,
) {}

export class AdminUserUpdateRoleBulkActionDto extends createZodDto(
  AdminUserUpdateRoleBulkActionSchema,
) {}

export type AdminUserTableBulkActionsDto =
  | AdminUserDeleteBulkActionDto
  | AdminUserUpdateGroupBulkActionDto
  | AdminUserUpdateRoleBulkActionDto;
