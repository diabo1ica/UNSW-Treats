import { requestClear, requestRegister, requestLogin } from './request';
import { OK, INPUT_ERROR } from './request';
describe('Error Cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
  });

  test('Email doesn\'t belong to a user', () => {
    expect(requestLogin('z5363496@unsw.edu.au', 'aero123').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Password is not correct', () => {
    expect(requestLogin('z5363495@unsw.edu.au', 'aero12').statusCode).toStrictEqual(INPUT_ERROR);
  });
});

describe('Working Cases', () => {
  let userId1: number;
  beforeEach(() => {
    requestClear();
    userId1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.authUserId;
  });

  test('User Login', () => {
    const res = requestLogin('z5363495@unsw.edu.au', 'aero123');
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining({
      token: expect.any(String),
      authUserId: userId1
    }));
  });
});
