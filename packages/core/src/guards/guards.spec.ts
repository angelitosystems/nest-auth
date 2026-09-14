import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';

describe('RolesGuard & PermissionsGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('RolesGuard', () => {
    it('should allow access if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const guard = new RolesGuard(reflector, { jwt: { secret: 's' }, adapter: null as any });

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['user'] } }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow access in OR mode when user has at least one role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'nest_auth:roles') return ['admin', 'manager'];
        return 'OR';
      });
      const guard = new RolesGuard(reflector, { jwt: { secret: 's' }, adapter: null as any });

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['manager'] } }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny access in AND mode if user is missing one role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'nest_auth:roles') return ['admin', 'billing'];
        return 'AND';
      });
      const guard = new RolesGuard(reflector, { jwt: { secret: 's' }, adapter: null as any });

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: ['admin'] } }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;

    beforeEach(() => {
      guard = new PermissionsGuard(reflector);
    });

    it('should match wildcard superuser * against any required permission', () => {
      expect(guard.matchPermission('users.delete', ['*'])).toBe(true);
      expect(guard.matchPermission('billing.charge', ['*'])).toBe(true);
    });

    it('should match prefix wildcard users.* against users.read and users.delete', () => {
      expect(guard.matchPermission('users.read', ['users.*'])).toBe(true);
      expect(guard.matchPermission('users.delete', ['users.*'])).toBe(true);
      expect(guard.matchPermission('roles.delete', ['users.*'])).toBe(false);
    });

    it('should allow access when user has matching permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['users.create']);

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({ user: { permissions: ['users.*'] } }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should deny access when user lacks required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['roles.manage']);

      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
        switchToHttp: () => ({
          getRequest: () => ({ user: { permissions: ['users.*'] } }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });
});
