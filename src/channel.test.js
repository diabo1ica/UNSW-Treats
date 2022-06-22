import { channelInviteV1, channelJoinV1 } from './channel'
import { authRegisterV1, authLoginV1 } from './auth'
import { channelsCreateV1 } from './channels'
import { clearV1 } from './other'

/*test ('Testing Invitation(exist)', () => {
  clearV1(); 
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const u_id = a.authUserId;
  
  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const user_authUserId = b.authUserId;
  
  // create Channel1 which isPublic
  const c = channelsCreateV1(user_authUserId, 'Channel1', 'true');  
  const channel_id = c.channelId;  
  
  expect(channelInviteV1(user_authUserId, channel_id, u_id)).toStrictEqual({});
});


test('Testing Invitation(do not exist (1))', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const u_id = a.authUserId;
  
  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const user_authUserId = b.authUserId;
  
   // create Channel1 which isPublic
  const c = channelsCreateV1(user_authUserId, 'Channel1', 'true');  
  const channel_id = c.channelId;
  
  expect(channelInviteV1(user_authUserId, '10000000', u_id)).toStrictEqual({error: 'error'});
});


test('Testing Invitation(do not exist (2))', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const u_id = a.authUserId;
  
  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const user_authUserId = b.authUserId;
  
  // create Channel1 which isPublic
  const c = channelsCreateV1(user_authUserId, 'Channel1', 'true');  
  const channel_id = c.channelId;
  
  expect(channelInviteV1(user_authUserId, channel_id, 1000000)).toStrictEqual({error: 'error'});
});

test('Testing Invitation(do not exist (3))', () => {
  clearV1(); 4
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const u_id = a.authUserId;
  
  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const user_authUserId = b.authUserId;
  
  // create Channel1 which isPublic
  const c = channelsCreateV1(user_authUserId, 'Channel1', 'true');  
  const channel_id = c.channelId;
  
  expect(channelInviteV1(u_id, channel_id, user_authUserId)).toStrictEqual({});
});*/














