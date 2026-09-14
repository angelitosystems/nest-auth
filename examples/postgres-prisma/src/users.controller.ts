import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { CurrentUser, Roles, RolesGuard, Permissions, PermissionsGuard, Public } from '@angelitosystems/nest-auth';

@Controller('users')
export class UsersController {
  @Public()
  @Get('public-status')
  getPublicStatus() {
    return { status: 'system operational' };
  }

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Get('admin-panel')
  getAdminPanel() {
    return { message: 'Welcome to the admin panel' };
  }

  @Permissions('users.delete')
  @UseGuards(PermissionsGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return { message: `User ${id} deleted successfully` };
  }
}
