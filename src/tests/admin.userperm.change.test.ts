import { OWNER, MEMBER } from '../util';
import { requestClear, requestRegister, requestLogin, requestAdminPermChange } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('test suite for admin/userpermission/change/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let userId1: number;
  let userId2: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    userId1 = requestLogin('apple@gmail.com', 'apple10').body.authUserId;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    userId2 = requestLogin('banana@gmail.com', 'banana10').body.authUserId;
  });

  test('success', () => {
    const adminObj = requestAdminPermChange(usertoken1, userId2, OWNER);
    expect(adminObj.statusCode).toStrictEqual(OK);
    expect(adminObj.body).toEqual({});
  });

  test('Invalid uId (400 error)', () => {
    expect(requestAdminPermChange(usertoken1, -1, OWNER).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('invalid permissionId (400 error)', () => {
    expect(requestAdminPermChange(usertoken1, userId2, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('user already is given permission (400 error)', () => {
    expect(requestAdminPermChange(usertoken1, userId2, MEMBER).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('uId is only global owner remain cannot demote (400 error)', () => {
    expect(requestAdminPermChange(usertoken1, userId1, MEMBER).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('authuser is not globall owner (403 error)', () => {
    expect(requestAdminPermChange(usertoken2, userId1, OWNER).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
