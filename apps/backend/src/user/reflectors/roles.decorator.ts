import { Reflector } from '@nestjs/core';
import { UserRole } from '@repo/database';

export const Roles = Reflector.createDecorator<UserRole[]>();
