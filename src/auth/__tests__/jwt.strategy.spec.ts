import { ExtractJwt } from 'passport-jwt';
import { JwtStrategy } from '../services/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const payload = {
    sub: 'user-uuid-123',
    email: 'test@example.com',
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('deve ser definido corretamente', () => {
    expect(strategy).toBeDefined();
  });

  it('deve conter configurações corretas de extração do token', () => {
    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    const mockRequest = {
      headers: {
        authorization: 'Bearer teste-token',
      },
    };
    expect(extractor(mockRequest as any)).toBe('teste-token');
  });

  it('deve validar o payload corretamente', async () => {
    const result = await strategy.validate(payload);
    expect(result).toEqual({
      userId: 'user-uuid-123',
      email: 'test@example.com',
    });
  });
});
