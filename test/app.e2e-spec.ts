import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common/interfaces';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const TEST_PORT = 3334;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(TEST_PORT);

    prisma = app.get(PrismaService);
    pactum.request.setBaseUrl(`http://localhost:${TEST_PORT}`);

    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Sign Up', () => {
      it('should throw if email is not provided', () => {
        const dto = {
          password: '123456',
          firstName: 'Gabriel',
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if password is not provided', () => {
        const dto = {
          email: 'ggonpereira@gmail.com',
          firstName: 'Gabriel',
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if firstName is not provided', () => {
        const dto = {
          email: 'ggonpereira@gmail.com',
          password: '123456',
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if no body is provided', () =>
        pactum.spec().post(`/auth/signup`).expectStatus(400));

      it('should signup', () => {
        const dto: SignUpDto = {
          email: 'ggonpereira@gmail.com',
          password: '123456',
          firstName: 'Gabriel',
        };

        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign In', () => {
      it('should throw if email is not provided', () => {
        const dto = {
          password: '123456',
        };

        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if password is not provided', () => {
        const dto = {
          email: 'ggonpereira@gmail.com',
        };

        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if no body is provided', () =>
        pactum.spec().post(`/auth/signin`).expectStatus(400));

      it('should signin', () => {
        const dto: SignInDto = {
          email: 'ggonpereira@gmail.com',
          password: '123456',
        };

        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAT', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(`/users/me`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {});
  });

  describe('Bookmarks', () => {
    describe('Get bookmark', () => {});

    describe('Create bookmark', () => {});

    describe('Get bookmark by id', () => {});

    describe('Edit bookmark', () => {});

    describe('Delete bookmark', () => {});
  });
});
