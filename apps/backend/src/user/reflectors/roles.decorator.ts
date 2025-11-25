import { Reflector } from '@nestjs/core';
import { UserRole } from '@repo/database/client';

export const Roles = Reflector.createDecorator<UserRole[]>();
