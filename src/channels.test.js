import { channelInviteV1, channelJoinV1 } from './channel'
import { authRegisterV1, authloginV1 } from './auth'
import { channelsCreateV1, channelsListV1 } from './channels'

test('Testing ChannelsList (do not exist)', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  expect(channelsListV1(user_authUserId)).toStrictEqual([
    {
      channelId:[],
      name:[],
    },
  ]);
  
});

test('Testing ChannelsList (exist (1))', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel1', true);
  const channel_Id = b.channelId;
  expect(channelsListV1(user_authUserId)).toStrictEqual([
    {
      channelId: user_authUserId,
      name: 'Channel1',
    },
  ]);  
});

test('Testing ChannelsList (exist (2))', () => {
  clearV1();
  authRegisterV1('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = authloginV1('justinbieber@gmail.com', '1122334455');
  const user_authUserId = a.authUserId;
  const b = channelsCreateV1(user_authUserId, 'Channel1', true);
  const channel_Id = b.channelId;
  const c = channelsCreateV1(user_authUserId, 'Channel2', true);
  const channel_Id2 = c.channelId;
  expect(channelsListV1(user_authUserId)).toStrictEqual([
    {
      channelId: user_authUserId,
      name: 'Channel1',
    },
    {
      channelId: user_authUserId2,
      name: 'Channel2',
    },
  ]);  
});
