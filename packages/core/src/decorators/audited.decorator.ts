import { SetMetadata } from '@nestjs/common';
import { AUDITED_KEY } from '../constants/auth.constants';

export interface AuditedOptions {
  action?: string;
  entity?: string;
}

export const Audited = (options: AuditedOptions = {}) => SetMetadata(AUDITED_KEY, options);
