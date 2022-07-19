import { authRegisterV1, authLoginV1 } from './auth';
import { clearV1 } from './other';

describe('authRegister tests', () => {
  beforeEach(() => {
    clearV1();
  });

  test('Valid authRegisterV1', () => {
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual(expect.objectContaining({
      authUserId: expect.any(Number),
    }));
    expect(authRegisterV1('valid@gmail.com', 'passionlip', 'Passion', 'Lip')).toStrictEqual(expect.objectContaining({
      authUserId: expect.any(Number),
    }));
  });

  test('Email not valid', () => {
    expect(authRegisterV1('Strongjawstrongjaw', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({ error: 'error' });
  });

  test('Email taken', () => {
    authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw');
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({ error: 'error' });
  });

  test('Password not valid', () => {
    expect(authRegisterV1('validemail@gmail.com', 'drow', 'Strongjaw', 'Strongjaw')).toStrictEqual({ error: 'error' });
  });

  test('First name not valid', () => {
    const first = 'Percival Fredickstein von Kowalski de Rolo the twenty first';
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', first, 'Strongjaw')).toStrictEqual({ error: 'error' });
  });

  test('Last name not valid', () => {
    const last = 'Percival Fredickstein von Kowalski de Rolo the twenty first';
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', last)).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for authLoginV1', () => {
  let userId1: number;

  beforeEach(() => {
    userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid Email', () => {
    expect(() => authLoginV1('z5363394521', 'aero123')).toThrow(Error);
  });

  test('Email doesn\'t belong to a user', () => {
    expect(() => authLoginV1('z32132132@gmail.com', 'aero123')).toThrow(Error);
  });

  test('Password is not correct', () => {
    expect(() => authLoginV1('z5363495@unsw.edu.au', 'aero321')).toThrow(Error);
  });

  test('Correct return type', () => {
    expect(authLoginV1('z5363495@unsw.edu.au', 'aero123')).toStrictEqual(expect.objectContaining({
      authUserId: userId1,
    }));
  });
});

