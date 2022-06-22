import { channelInviteV1, channelJoinV1 } from './channel'
import { authRegisterV1, authloginV1 } from './auth'
import { channelsCreateV1, channelsListV1 } from './channels'

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  expect(channelsCreateV1(user_authUserId, ' ', 'true')).toStrictEqual({error: 'error'}); 
});

test('Testing ChannelsCreate (error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  expect(channelsCreateV1(user_authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', 'true')).toStrictEqual({error: 'error'}); 
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel1', 'true');
  const channel_id = b.channelId;
  expect(b).toStrictEqual(channel_id);
});

test('Testing ChannelsCreate (no error)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel2', 'false');
  const channel_id = b.channelId;
  expect(b).toStrictEqual(channel_id);
});


