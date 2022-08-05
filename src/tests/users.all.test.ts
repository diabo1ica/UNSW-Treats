import { requestClear, requestRegister, requestUsersAll } from './request';
import { OK, AUTHORISATION_ERROR } from './request';

describe('Test suite for /users/all/v1', () => {
  let usertoken1: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree');
  });

  test('Invalid token', () => {
    expect(requestUsersAll('-' + usertoken1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('users all (no error)', () => {
    const userObj = requestUsersAll(usertoken1);

    expect(userObj.statusCode).toStrictEqual(OK);
    expect(userObj.body).toEqual(expect.objectContaining(
      {
        users: expect.arrayContaining([
          {
            userId: 1,
            email: 'apple@gmail.com',
            nameFirst: 'Apple',
            nameLast: 'Tree',
            handleStr: 'appletree',
            profileImgUrl: expect.any(String),
          },
          {
            userId: 2,
            email: 'banana@gmail.com',
            nameFirst: 'Banana',
            nameLast: 'Tree',
            handleStr: 'bananatree',
            profileImgUrl: expect.any(String),
          },
        ])
      }));
  });
});
