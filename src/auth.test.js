import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';

describe('Sample test', () => {
  beforeEach(() => {
      clearV1();
    });

  test('Valid authRegisterV1',() => {
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual(expect.objectContaining({
      authUserId: expect.any(Number),
    }));
    expect(authRegisterV1('valid@gmail.com', 'passionlip', 'Passion', 'Lip')).toStrictEqual(expect.objectContaining({
      authUserId: expect.any(Number),
    }));
  });

  test('Email not valid',() => {
    expect(authRegisterV1('Strongjawstrongjaw', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({error: 'error'});
  });

  test('Email taken',() => {
    authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw');
    expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({error: 'error'});
  });

  test('Password not valid',() => {
    expect(authRegisterV1('validemail@gmail.com', 'drow', 'Strongjaw', 'Strongjaw')).toStrictEqual({error: 'error'});
  });

  test('First name not valid',() => {
    const first = 'Percival Fredickstein von Kowalski de Rolo the twenty first'
      expect(authRegisterV1('validemail@gmail.com', 'drowssap', first, 'Strongjaw')).toStrictEqual({error: 'error'});
  });

  test('Last name not valid',() => {
    const last = 'Percival Fredickstein von Kowalski de Rolo the twenty first'
      expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', last)).toStrictEqual({error: 'error'});
  });
});

describe('Test suite for authLoginV1', () => {
  let user_id1;
  let user_id2;
  let user_id3;
  let user_id4;
  
  beforeEach(() => {
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    user_id3 = authRegisterV1('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    user_id4 = authRegisterV1('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
  });
  
  afterEach(() => {
    clearV1();
  });
  
  test('Email doesn\'t belong to a user', () => {
    expect(authLoginV1('z32132132@gmail.com', 'aero123')).toStrictEqual({error: 'error'});
  });
  
  test('Password is not correct', () => {
    expect(authLoginV1('z5363495@unsw.edu.au', 'aero321')).toStrictEqual({error: 'error'});
  });
  
  test('Correct return type', () => {
    expect(authLoginV1('z5363495@unsw.edu.au', 'aero123')).toStrictEqual(expect.objectContaining({
      authUserId: user_id1,
    },));
  });
});

