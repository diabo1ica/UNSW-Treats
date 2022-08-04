test('testing', () => {
  expect(1 + 1).toStrictEqual(2);
});

/*
import { requestUserStats, requestChannelsCreate, requestRegister, requestLogin, requestClear } from './request';

describe('search/v1 tests', () => {
  let token : string;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    requestChannelsCreate(token, 'Channel1', true);
  });

  test('user/stats/v1 Successfull', () => {
    expect(requestUserStats(token).body).toStrictEqual({
      channelsJoined: expect.arrayContaining([
        {
          numChannelsJoined: 0,
          timeStamp: expect.any(Number),
        }
      ]),
      dmsJoined: [],
      messagesSent: [],
      involvementRate: 1,
    });
  });

  test('user/stats/v1 Empty', () => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    expect(requestUserStats(token).body).toStrictEqual({
      channelsJoined: [],
      dmsJoined: [],
      messagesSent: [],
      involvementRate: 0,
    });
  });
});
*/
