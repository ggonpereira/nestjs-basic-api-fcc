import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common/interfaces';
import { ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignInDto, SignUpDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';

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

    describe('Edit user', () => {
      it('should edit current user', () => {
        const dto: EditUserDto = {
          lastName: 'Pereira',
          email: 'ggonpereira+1@gmail.com',
        };

        return pactum
          .spec()
          .patch(`/users`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      it('should throw if the title is missing', () => {
        const dto = {
          description: 'Lorem ipsum',
          link: 'http://example.com',
        };

        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(400);
      });

      it('should throw if the link is missing', () => {
        const dto = {
          title: 'Bookmark',
          description: 'Lorem ipsum',
        };

        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(400);
      });

      it('should create the bookmark if only the description is missing', () => {
        const dto = {
          title: 'Bookmark without description',
          link: 'http://example.com',
        };

        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(null)
          .expectBodyContains(dto.link);
      });

      it('should create the bookmark if everything is provided', () => {
        const dto: CreateBookmarkDto = {
          title: 'Bookmark',
          description: 'Lorem ipsum',
          link: 'http://example.com',
        };

        return pactum
          .spec()
          .post(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectJsonLength(2);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark', () => {
      it('should edit bookmark by id', () => {
        const dto = {
          title: 'Edited bookmark',
          link: 'http://example.com/2',
        };

        return pactum
          .spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(204);
      });

      it('should get only one bookmark', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
  });
});
