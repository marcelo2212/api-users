import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';

describe('LoginDto', () => {
  it('deve validar um DTO válido', async () => {
    const input = {
      email: 'teste@example.com',
      password: 'senhaSegura123',
    };

    const dto = plainToInstance(LoginDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('deve retornar erro para email inválido', async () => {
    const input = {
      email: 'email-invalido',
      password: 'senhaSegura123',
    };

    const dto = plainToInstance(LoginDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('deve retornar erro se o campo password não for string', async () => {
    const input = {
      email: 'teste@example.com',
      password: 12345,
    };

    const dto = plainToInstance(LoginDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('deve retornar erro se campos forem ausentes', async () => {
    const input = {};

    const dto = plainToInstance(LoginDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    const properties = errors.map((e) => e.property);
    expect(properties).toContain('email');
    expect(properties).toContain('password');
  });
});
