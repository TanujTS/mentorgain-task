import { IsUUID, IsIn, IsArray, ArrayMinSize } from 'class-validator';

export class CreateSuperadminDto {}

export class CreateAdminDto {
  @IsUUID()
  userId: string;
}

export class UpdateUserRoleDto {
  @IsIn(['user', 'admin', 'superadmin'])
  role: 'user' | 'admin' | 'superadmin';
}

export class BulkUpdateEnrollmentStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  enrollmentIds: string[];

  @IsIn(['pending', 'accepted', 'rejected'])
  status: 'pending' | 'accepted' | 'rejected';
}
