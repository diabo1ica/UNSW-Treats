import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const authUserId = a.authUserId;
  expect(channelsCreateV1(authUserId, '', true)).toStrictEqual({ error: 'error' });
});

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const authUserId = a.authUserId;
  expect(channelsCreateV1(authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', true)).toStrictEqual({ error: 'error' });
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const authUserId = a.authUserId;
  const b = channelsCreateV1(authUserId, 'Channel1', true);
  expect(b).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const authUserId = a.authUserId;
  const b = channelsCreateV1(authUserId, 'Channel2', false);
  expect(b).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});

describe('Test suite for channelsListallV1', () => {
  let userId1: number, userId2: number, userId3: number, userId4: number;
  let channelId1: number, channelId2: number, channelId3: number, channelId4: number;

  describe('Error cases', () => {
    beforeEach(() => {
      clearV1();
    });

    afterEach(() => {
      clearV1();
    });
    test('No channels were created', () => {
      userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
      expect(channelsListallV1(userId1).channels).toStrictEqual([]);
    });

    test('Invalid authUserId', () => {
      userId4 = authRegisterV1('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
      expect(channelsListallV1(-userId4)).toStrictEqual({ error: 'error' });
    });
  });
  describe('Working cases', () => {
    beforeEach(() => {
      userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
      userId2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
      userId3 = authRegisterV1('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
      userId4 = authRegisterV1('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
      channelId1 = channelsCreateV1(userId1, 'Aero', true).channelId;
      channelId2 = channelsCreateV1(userId2, 'Aero1', true).channelId;
      channelId3 = channelsCreateV1(userId3, 'Aero2', false).channelId;
      channelId4 = channelsCreateV1(userId4, 'Aero3', false).channelId;
    });

    afterEach(() => {
      clearV1();
    });

    test('Correct return type (list 4 channels)', () => {
      expect(channelsListallV1(userId1)).toStrictEqual(expect.objectContaining(
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
});

describe('Testing channelslist', () => {
  test('return all channles involved for userid', () => {
    clearV1();

    const userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve',
      'Berrospi').authUserId;
    const channelAir = channelsCreateV1(userId1, 'air', true).channelId;

    expect(channelsListV1(userId1)).toStrictEqual(expect.objectContaining(
      {
        channels: expect.arrayContaining([
          {
            channelId: channelAir,
            name: 'air',
          },
        ])
      }));
  });
});
