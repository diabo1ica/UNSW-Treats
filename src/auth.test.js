import { authRegisterV1 } from './auth';
import {clearV1} from './other';

test('Valid authRegisterV1',() => {
  expect(authRegisterV1('validemail@gmail.com', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({authUserId: 1,});
});

test('Email not valid',() => {
  expect(authRegisterV1('Strongjawstrongjaw', 'drowssap', 'Strongjaw', 'Strongjaw')).toStrictEqual({error: 'error'});
});

test('Email taken',() => {
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
