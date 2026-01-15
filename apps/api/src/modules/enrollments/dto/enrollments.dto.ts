import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class FormResponseDto {
  @IsUUID()
  formFieldId: string;

  @IsString()
  @IsOptional()
  textResponse?: string;

  @IsInt()
  @IsOptional()
  numberResponse?: number;

  @IsString()
  @IsOptional()
  selectResponse?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multiSelectResponse?: string[];

  @IsString()
  @IsOptional()
  fileResponse?: string;
}

export class CreateEnrollmentDto {
  @IsUUID()
  mentorshipProgramId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormResponseDto)
  @IsOptional()
  responses?: FormResponseDto[];
}

export class UpdateEnrollmentStatusDto {
  status: 'accepted' | 'rejected';
}
