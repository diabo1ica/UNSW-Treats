import { requestRegister, requestClear, requestChannelslistall, requestLogin, requestChannelsCreate } from './request';
import { OK, AUTHORISATION_ERROR } from './request';

let channelId1: number, channelId2: number, channelId3: number, channelId4: number;
let token1: string, token2: string, token3: string, token4:string;

describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
  });

  test('No channels were created', () => {
    expect(requestChannelslistall(token1).body.channels).toStrictEqual([]);
  });

  test('Invalid token', () => {
    expect(requestChannelslistall(token2 + '3').statusCode).toStrictEqual(AUTHORISATION_ERROR);
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
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').body.token;
    channelId1 = requestChannelsCreate(token1, 'Aero', true).body.channelId;
    channelId2 = requestChannelsCreate(token2, 'Aero1', true).body.channelId;
    channelId3 = requestChannelsCreate(token3, 'Aero2', false).body.channelId;
    channelId4 = requestChannelsCreate(token4, 'Aero3', false).body.channelId;
  });

  test('Correct output (list 4 channels)', () => {
    const res = requestChannelslistall(token1);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining(
      {
        channels: expect.arrayContaining([
          {
            channelId: channelId1,
            name: 'Aero',
          },
          {
            channelId: channelId2,
            name: 'Aero1',
          },
          {
            channelId: channelId3,
            name: 'Aero2',
          },
          {
            channelId: channelId4,
            name: 'Aero3',
          }
        ])
      }));
  });
});
