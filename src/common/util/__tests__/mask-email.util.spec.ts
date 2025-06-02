import { maskEmail } from '../mask-email.util';

describe('maskEmail', () => {
  it('deve mascarar corretamente e-mails com mais de 3 caracteres no usuário', () => {
    const result = maskEmail('marcelo@example.com');
    expect(result).toBe('mar***@example.com');
  });

  it('deve mascarar corretamente e-mails com exatamente 3 caracteres no usuário', () => {
    const result = maskEmail('abc@example.com');
    expect(result).toBe('***@example.com');
  });

  it('deve mascarar corretamente e-mails com menos de 3 caracteres no usuário', () => {
    const result = maskEmail('ab@example.com');
    expect(result).toBe('***@example.com');
  });
});
