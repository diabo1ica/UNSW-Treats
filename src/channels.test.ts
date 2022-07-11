import { channelInviteV1, channelJoinV1 } from './channel';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { clearV1 } from './other';

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
<<<<<<< HEAD
  expect(channelsCreateV1(user_authUserId, '', true)).toStrictEqual({error: 'error'}); 
=======
  expect(channelsCreateV1(user_authUserId, '', true)).toStrictEqual({ error: 'error' });
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
});

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
<<<<<<< HEAD
  expect(channelsCreateV1(user_authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', true)).toStrictEqual({error: 'error'}); 
=======
  expect(channelsCreateV1(user_authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', true)).toStrictEqual({ error: 'error' });
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel1', true);
  const channel_id = b.channelId;
  expect(b).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel2', false);
  const channel_id = b.channelId;
  expect(b).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});

describe('Test suite for channelsListallV1', () => {
  let user_id1, user_id2, user_id3, user_id4;
  let channel_id1, channel_id2, channel_id3, channel_id4;
  beforeEach(() => {
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    user_id3 = authRegisterV1('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    user_id4 = authRegisterV1('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    channel_id1 = channelsCreateV1(user_id1, 'Aero', true).channelId;
    channel_id2 = channelsCreateV1(user_id2, 'Aero1', true).channelId;
    channel_id3 = channelsCreateV1(user_id3, 'Aero2', false).channelId;
    channel_id4 = channelsCreateV1(user_id4, 'Aero3', false).channelId;
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid authUserId', () => {
    expect(channelsListallV1(-user_id4)).toStrictEqual({ error: 'error' });
  });

  test('Correct return type (list 4 channels)', () => {
    expect(channelsListallV1(user_id1)).toStrictEqual(expect.objectContaining(
      {
        channels: expect.arrayContaining([
          {
            channelId: channel_id1,
            name: 'Aero',
          },
          {
            channelId: channel_id2,
            name: 'Aero1',
          },
          {
            channelId: channel_id3,
            name: 'Aero2',
          },
          {
            channelId: channel_id4,
            name: 'Aero3',
          }
        ])
      }));
  });
});

describe('Testing channelslist', () => {
  test('return all channles involved for userid', () => {
    clearV1();

<<<<<<< HEAD
   expect(channelsListV1( user_id1 )).toStrictEqual(expect.objectContaining(
   {
   channels: expect.arrayContaining([
   {
   channelId: channel_air,
    name: 'air',
    }, 
   ])
   }));   
   });
 });
=======
    const user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve',
      'Berrospi').authUserId;
    const channel_air = channelsCreateV1(user_id1, 'air', true).channelId;

    expect(channelsListV1(user_id1)).toStrictEqual(expect.objectContaining(
      {
        channels: expect.arrayContaining([
          {
            channelId: channel_air,
            name: 'air',
          },
        ])
      }));
  });
});
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
