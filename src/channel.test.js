import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel.js';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js';

describe('channelDetails tests', () => {
  beforeEach(() => {
    authRegisterV1('email@gmail.com', 'drowssap', 'Drow', 'Sapling');
    channelsCreateV1(1, 'Ghor Dranas', true);
  });

  afterEach(() => {
    clearV1();
  });  
  
  test('Valid Channel Details',() => {
    expect(channelDetailsV1(1, 1)).toStrictEqual({
      channelId: 1,
      name: 'Ghor Dranas', 
      isPublic: true,
      members: [{
        uId: 1,
        email: 'email@gmail.com',
        nameFirst: 'Drow',
        nameLast: 'Sapling',
        handleStr: 'DrowSapling',
        channelPermsId: 1,
      }]
    });
  });
  
  test('Invalid authId and channelId',() => {
    expect(channelDetailsV1(2, 2)).toStrictEqual({error: 'error'});
  });

  test('Invalid channelId',() => {
    expect(channelDetailsV1(1, 2)).toStrictEqual({error: 'error'});
  });

  test('Valid channelId but invalid authId',() => {
    expect(channelDetailsV1(2, 1)).toStrictEqual({error: 'error'});
  });
});

describe('Test suite for channelMessagesV1', () => {
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
  
  test('Invalid channelId', () => {
    expect(channelMessagesV1(user_id1, -channel_id1, 0)).toStrictEqual({error: 'error'});
  });

  test('Start is greater than total number messages', () => {
    expect(channelMessagesV1(user_id1, channel_id1, 10000000)).toStrictEqual({error: 'error'});
  });
  
  test('User is not a member of valid channel', () => {
    expect(channelMessagesV1(user_id3, channel_id1, 0)).toStrictEqual({error: 'error'});
  });
  
  test('Correct return type', () => {
    expect(channelMessagesV1(user_id1, channel_id1, 0)).toStrictEqual(expect.objectContaining(
    {
      messages: expect.arrayContaining([]),
      start: 0,
      end: -1,      
    }));
  });
});

test ('Testing Invitation(exist)', () => {
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
  
  expect(channelInviteV1(user_authUserId, channel_id, user_authUserId)).toStrictEqual({error: 'error'});
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
  
  expect(channelInviteV1(u_id, channel_id, user_authUserId)).toStrictEqual({error: 'error'});
});
