import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFormFieldDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['text', 'number', 'select', 'multi_select', 'file'])
  fieldType: 'text' | 'number' | 'select' | 'multi_select' | 'file';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateFormFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFormFieldDto)
  fields: CreateFormFieldDto[];
}

export class UpdateFormFieldDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['text', 'number', 'select', 'multi_select', 'file'])
  @IsOptional()
  fieldType?: 'text' | 'number' | 'select' | 'multi_select' | 'file';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
