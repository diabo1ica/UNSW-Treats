import { requestClear, requestRegister, requestLogout, requestChannelsCreate } from './request';
import { OK } from './request';

describe('auth path tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Test successful and unsuccessful auth register', () => {
    const res = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toEqual({
      token: expect.any(String),
      authUserId: 1
    });
    const res2 = requestRegister('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe');
    expect(res2.statusCode).toStrictEqual(OK);
    expect(res2.body).toEqual({
      token: expect.any(String),
      authUserId: 2
    });
    const res3 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    // expect(res3.statusCode).toStrictEqual(INPUT_ERROR);
    expect(res3.body).toEqual({ error: 'error' });
  });

  test('Test logout', () => {
    const res = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body;
    const res2 = requestLogout(res.token);
    expect(res2.statusCode).toStrictEqual(OK);
    expect(res2.body).toStrictEqual({});
    const channel = requestChannelsCreate(res.token, 'Xhorhas', true).body;
    expect(channel).toStrictEqual({ error: 'error' });
  });
});
