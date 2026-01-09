import {
  LoginSchemaWithEmail,
  LoginSchemaWithPhone,
  RegisterSchema,
} from '@repo/types';
import { createZodDto } from 'nestjs-zod';

export class RegisterDTO extends createZodDto(RegisterSchema) {}
export class LoginWithPhoneDTO extends createZodDto(LoginSchemaWithPhone) {}
export class LoginWithEmailDTO extends createZodDto(LoginSchemaWithEmail) {}
