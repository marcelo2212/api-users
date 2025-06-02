import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

describe('User Entity', () => {
  it('deve gerar um hash da senha corretamente', async () => {
    const user = new User();
    user.password = 'minhaSenha123';

    await user.hashPassword();

    expect(user.password).not.toBe('minhaSenha123');
    expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);
  });

  it('deve validar a senha corretamente (true)', async () => {
    const user = new User();
    const plain = 'senhaSegura';
    user.password = await bcrypt.hash(plain, 10);

    const isValid = await user.validatePassword(plain);
    expect(isValid).toBe(true);
  });

  it('deve invalidar senha incorreta (false)', async () => {
    const user = new User();
    user.password = await bcrypt.hash('senhaCorreta', 10);

    const isValid = await user.validatePassword('senhaErrada');
    expect(isValid).toBe(false);
  });
});
