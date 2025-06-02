import {
  IsEmail,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome inválido' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de nascimento inválida' })
  birthday?: string;

  @IsOptional()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'A senha deve conter letras e números.',
  })
  password?: string;
}
