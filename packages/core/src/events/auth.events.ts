import { User, Session, Role, Permission } from '../interfaces/models.interface';

export class UserRegisteredEvent {
  constructor(
    public readonly user: User,
    public readonly verificationToken?: string,
  ) {}
}

export class UserLoggedInEvent {
  constructor(
    public readonly user: User,
    public readonly session?: Session,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

export class UserLoginFailedEvent {
  constructor(
    public readonly email: string,
    public readonly reason: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId?: string,
  ) {}
}

export class PasswordChangedEvent {
  constructor(public readonly user: User) {}
}

export class PasswordResetRequestedEvent {
  constructor(
    public readonly user: User,
    public readonly resetToken: string,
  ) {}
}

export class PasswordResetEvent {
  constructor(public readonly user: User) {}
}

export class EmailVerifiedEvent {
  constructor(public readonly user: User) {}
}

export class RoleAssignedEvent {
  constructor(
    public readonly userId: string,
    public readonly roleName: string,
  ) {}
}

export class RoleRemovedEvent {
  constructor(
    public readonly userId: string,
    public readonly roleName: string,
  ) {}
}

export class PermissionGrantedEvent {
  constructor(
    public readonly roleId: string,
    public readonly permissionName: string,
  ) {}
}

export class PermissionRevokedEvent {
  constructor(
    public readonly roleId: string,
    public readonly permissionName: string,
  ) {}
}

export class SessionRevokedEvent {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}
