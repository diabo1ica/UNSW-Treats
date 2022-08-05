import { requestClear, requestRegister, requestResetPassword, requestResetReq, OK } from './request';
import { getData, DataStr } from '../dataStore';

describe('auth reset password whitebox tests', () => {
  let token: string;
  const email = 'aimerrythm@gmail.com';
  beforeEach(() => {
    requestClear();
    const res = requestRegister(email, 'Sk8terboiyo', 'Aimer', 'Rythm').body;
    token = res.token;
  });

  test('Test valid reset', () => {
    expect(requestResetReq(token, email).statusCode).toStrictEqual(OK);
    const data: DataStr = getData(true);
    const resetCode: string = data.resetArray[0].resetCode;
    expect(requestResetPassword(resetCode, 'Walpugris').statusCode).toStrictEqual(OK);
  });
});
