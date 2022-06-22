import { channelInviteV1, channelJoinV1 } from './channel'
import { authRegisterV1, authLoginV1 } from './auth'
import { channelsCreateV1, channelsListV1 } from './channels'
import { clearV1 } from './other'

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  expect(channelsCreateV1(user_authUserId, '', 'true')).toStrictEqual({error: 'error'}); 
});

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  expect(channelsCreateV1(user_authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', 'true')).toStrictEqual({error: 'error'}); 
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authLoginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel1', 'true');
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
  const b = channelsCreateV1(user_authUserId, 'Channel2', 'false');
  const channel_id = b.channelId;
  expect(b).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});


