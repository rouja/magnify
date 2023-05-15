import { faker } from '@faker-js/faker';
import { User } from '../../types';
import { MagnifyLocales } from '../../utils';

export default function createRandomUser(): User {
  return {
    id: faker.datatype.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    language: MagnifyLocales.EN,
    name: faker.name.fullName(),
  };
}

export const _users = [...Array(5)].map(() => createRandomUser());