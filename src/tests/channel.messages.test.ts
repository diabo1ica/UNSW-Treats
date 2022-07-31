import { requestRegister, requestLogin, requestChannelMessages, requestChannelsCreate, requestClear } from './request';

let channelId1: number, channelId2: number;
let token1: string, token2: string, token3: string;

describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei');
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    channelId1 = requestChannelsCreate(token1, 'Aero', true).body.channelId;
    channelId2 = requestChannelsCreate(token2, 'Aero1', true).body.channelId;
  });

  test('Invalid Token', () => {
    expect(requestChannelMessages('-' + token2, channelId2, 0).body).toStrictEqual({ error: 'error' });
  });

  test('Invalid channelId', () => {
    expect(requestChannelMessages(token1, -channelId1, 0).body).toStrictEqual({ error: 'error' });
  });

  test('Start is greater than total number messages', () => {
    expect(requestChannelMessages(token1, channelId1, 10000000).body).toStrictEqual({ error: 'error' });
  });

  test('User is not a member of valid channel', () => {
    expect(requestChannelMessages(token3, channelId1, 0).body).toStrictEqual({ error: 'error' });
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei');
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    channelId1 = requestChannelsCreate(token1, 'Aero', true).body.channelId;
    channelId2 = requestChannelsCreate(token2, 'Aero1', true).body.channelId;
  });

  test('Correct return type', () => {
    expect(requestChannelMessages(token1, channelId1, 0).body).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([]),
        start: 0,
        end: -1,
      }));
  });
});
