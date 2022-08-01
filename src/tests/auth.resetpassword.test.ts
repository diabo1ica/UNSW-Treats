import { requestClear, requestRegister, requestResetPassword, requestResetReq } from './request';
import { OK, INPUT_ERROR } from './request';

describe('auth reset password tests', () => {
  let token: string;
  let email: string = 'diabolica657@gmail.com';
  const cheatCode: string = 'globalcode';
  beforeEach(() => {
    requestClear();
    token = requestRegister(email, 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
  });

  test('Test valid requests', () => {
    expect(requestResetReq(token, email).statusCode).toStrictEqual(OK);
    expect(requestResetPassword(token, cheatCode, 'Asd6579').statusCode).toStrictEqual(OK);
  });
  
  test('Test error cases', () => {
    expect(requestResetReq(token, email).statusCode).toStrictEqual(OK);
    // Test invalid password
    expect(requestResetPassword(token, cheatCode, 'ehe').statusCode).toStrictEqual(INPUT_ERROR);
    // Test invalid reset code
    expect(requestResetPassword(token, 'GGSTCoomer', 'ehetenandayo').statusCode).toStrictEqual(INPUT_ERROR);
    // Test user's session after request
    expect(requestResetPassword(token, cheatCode, 'Asd6579').statusCode).toStrictEqual(OK);
    expect(requestResetReq(token, email).statusCode).toStrictEqual(INPUT_ERROR);
  });
});