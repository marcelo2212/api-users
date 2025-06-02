import {
  IsEmail,
  IsNotEmpty,
  IsDateString,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsDateString(
    {},
    { message: 'Data de nascimento inválida. Use o formato YYYY-MM-DD.' },
  )
  birthday: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message: 'A senha deve conter letras e números.',
  })
  password: string;
}
