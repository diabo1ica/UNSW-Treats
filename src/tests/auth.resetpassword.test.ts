import { requestClear, requestRegister, requestResetPassword, requestResetReq } from './request';
import { OK, INPUT_ERROR } from './request';

describe('auth reset password tests', () => {
  let token: string;
  let email: string = 'diabolica657@gmail.com';
  beforeEach(() => {
    requestClear();
    token = requestRegister(email, 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
  });

  test('Test valid requests', () => {
    expect(requestResetReq(token, email).statusCode).toStrictEqual(OK);
  });
  
  test('Test error cases', () => {
    expect(requestResetReq(token, email).statusCode).toStrictEqual(OK);
    // Test invalid password
    expect(requestResetPassword('cheatCode', 'ehe').statusCode).toStrictEqual(INPUT_ERROR);
    // Test invalid reset code
    expect(requestResetPassword('GGSTCoomer', 'ehetenandayo').statusCode).toStrictEqual(INPUT_ERROR);
    // Test user's session after request
    expect(requestResetReq(token, email).statusCode).toStrictEqual(INPUT_ERROR);
  });
});