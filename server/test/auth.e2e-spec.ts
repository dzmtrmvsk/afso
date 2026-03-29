import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request.default(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
          organizationName: 'Test Organization',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email');
        });
    });

    it('should fail with invalid email', () => {
      return request.default(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
          organizationName: 'Test Organization',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request.default(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
          organizationName: 'Test Organization',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: `login${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Login',
      lastName: 'Test',
      role: 'agent',
      organizationName: 'Test Organization',
    };

    beforeAll(async () => {
      await request.default(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', () => {
      return request.default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should fail with invalid password', () => {
      return request.default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request.default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });
});
