import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';

describe('Auth & Users E2E', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - autenticação com sucesso', async () => {
    const res = await request(server).post('/auth/login').send({
      email: 'matheus@gmail.com',
      password: 'Matheus123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');

    accessToken = res.body.accessToken;
    userId = res.body.user.id;
  });

  it('GET /users - listagem autenticada', async () => {
    expect(accessToken).toBeDefined();

    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /users/:id - detalhe de usuário autenticado', async () => {
    expect(accessToken).toBeDefined();
    expect(userId).toBeDefined();

    const res = await request(server)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
  });

  it('PUT /users/:id - atualizar dados do usuário', async () => {
    expect(accessToken).toBeDefined();
    expect(userId).toBeDefined();

    const res = await request(server)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Matheus Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Matheus Atualizado');
  });

  it('POST /auth/refresh - renovar accessToken', async () => {
    const login = await request(server).post('/auth/login').send({
      email: 'matheus@gmail.com',
      password: 'Matheus123',
    });

    expect(login.status).toBe(201);
    const refreshToken = login.body.refreshToken;

    expect(refreshToken).toBeDefined();

    const res = await request(server).post('/auth/refresh').send({
      refreshToken,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('POST /auth/logout - logout do usuário', async () => {
    expect(accessToken).toBeDefined();

    const res = await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });
});
