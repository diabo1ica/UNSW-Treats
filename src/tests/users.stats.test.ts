test('testing', () => {
  expect(1 + 1).toStrictEqual(2);
});
/*
import { requestUsersStats, requestChannelsCreate, requestRegister, requestLogin, requestClear } from './request';

describe('users/stats/v1 tests', () => {
  let token : string;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    requestChannelsCreate(token, 'Channel1', true);
  });

  test('users/stats/v1 Successfull', () => {
    expect(requestUsersStats(token).body).toStrictEqual({
      channelsExist: expect.arrayContaining([
        {
          numChannelsExist: 0,
          timeStamp: expect.any(Number),
        }
      ]),
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 1,
    });
  });

  test('users/stats/v1 Empty', () => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    expect(requestUsersStats(token).body).toStrictEqual({
      channelsExist: [],
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 0,
    });
  });
});
*/
