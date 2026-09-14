import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY, ROLES_MODE_KEY } from '../constants/auth.constants';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const RolesMode = (mode: 'OR' | 'AND') => SetMetadata(ROLES_MODE_KEY, mode);
