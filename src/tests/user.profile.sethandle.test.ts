import { requestClear, requestRegister, requestUsersProfileSethandle } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite for users/profile/sethandle/v1', () => {
  let usertoken1: string;
  let usertoken2: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
  });

  test('no error', () => {
    const userObj = requestUsersProfileSethandle(usertoken1, 'SuperMan');
    expect(userObj.statusCode).toStrictEqual(OK);
    expect(userObj.body).toStrictEqual({});
  });

  test('Invalid token', () => {
    expect(requestUsersProfileSethandle(usertoken1 + '-', 'SuperMan').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('handle length not inclusive between 3 and 20 characters (400 error)', () => {
    expect(requestUsersProfileSethandle(usertoken1, 'S1').statusCode).toStrictEqual(INPUT_ERROR);
    expect(requestUsersProfileSethandle(usertoken1, '123456789101112131415word').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('contain character that are not alphanumeric (400 error)', () => {
    expect(requestUsersProfileSethandle(usertoken1, 'abc123~~~~~').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('handle occupied by another user (400 error)', () => {
    // handle 'superman' has being occupied by user2
    requestUsersProfileSethandle(usertoken2, 'superman');
    expect(requestUsersProfileSethandle(usertoken1, 'superman').statusCode).toStrictEqual(INPUT_ERROR);
  });
});
