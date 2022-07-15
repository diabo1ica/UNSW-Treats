import { authRegisterV1, authLoginV1 } from './auth';
import { clearV1 } from './other';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel';
import { channelsCreateV1 } from './channels';

describe('channelDetails tests', () => {
  beforeEach(() => {
    authRegisterV1('email@gmail.com', 'drowssap', 'Drow', 'Sapling');
    channelsCreateV1(1, 'Ghor Dranas', true);
  });

  afterEach(() => {
    clearV1();
  });

  test('Valid Channel Details', () => {
    expect(channelDetailsV1(1, 1)).toStrictEqual({
      name: 'Ghor Dranas',
      isPublic: true,
      ownerMembers: [{
        uId: expect.any(Number),
        email: 'email@gmail.com',
        nameFirst: 'Drow',
        nameLast: 'Sapling',
        handleStr: 'DrowSapling'
      }],
      allMembers: []
    });
  });

  test('Invalid authId and channelId', () => {
    expect(channelDetailsV1(2, 2)).toStrictEqual({ error: 'error' });
  });

  test('Invalid channelId', () => {
    expect(channelDetailsV1(1, 2)).toStrictEqual({ error: 'error' });
  });

  test('Valid channelId but invalid authId', () => {
    expect(channelDetailsV1(2, 1)).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for channelMessagesV1', () => {
  let userId1: number, userId3: number;
  let channelId1: number;
  beforeEach(() => {
    userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    userId3 = authRegisterV1('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    channelId1 = channelsCreateV1(userId1, 'Aero', true).channelId;
  });

  afterEach(() => {
    clearV1();
  });

  test('Invalid channelId', () => {
    expect(() => channelMessagesV1(userId1, -channelId1, 0)).toThrow(Error);
  });

  test('Start is greater than total number messages', () => {
    expect(() => channelMessagesV1(userId1, channelId1, 10000000)).toThrow(Error);
  });

  test('User is not a member of valid channel', () => {
    expect(() => channelMessagesV1(userId3, channelId1, 0)).toThrow(Error);
  });

  test('Correct return type', () => {
    expect(channelMessagesV1(userId1, channelId1, 0)).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([]),
        start: 0,
        end: -1,
      }));
  });
});

test('Testing Invitation(exist)', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const uId = a.authUserId;

  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const authUserId = b.authUserId;

  // create Channel1 which isPublic
  const c = channelsCreateV1(authUserId, 'Channel1', true);
  const channelId = c.channelId;

  expect(channelInviteV1(authUserId, channelId, uId)).toStrictEqual({});
});

test('Testing Invitation(do not exist (1))', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const uId = a.authUserId;

  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const authUserId = b.authUserId;

  // create Channel1 which isPublic
  channelsCreateV1(authUserId, 'Channel1', true);

  expect(channelInviteV1(authUserId, 10000000, uId)).toStrictEqual({ error: 'error' });
});

test('Testing Invitation(do not exist (2))', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const uId = a.authUserId;

  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const authUserId = b.authUserId;

  // create Channel1 which isPublic
  const c = channelsCreateV1(authUserId, 'Channel1', true);
  const channelId = c.channelId;

  expect(channelInviteV1(authUserId, channelId, -uId)).toStrictEqual({ error: 'error' });
});

test('Testing Invitation(do not exist (3))', () => {
  clearV1();
  const a = authRegisterV1('garyang@gmail.com', '12345678', 'Gary', 'Ang');
  const uId = a.authUserId;

  authRegisterV1('kennethkuo@gmail.com', '87654321', 'Kenneth', 'Kuo');
  // the authUserId is Kenneth id, Kenneth is the author.
  const b = authLoginV1('kennethkuo@gmail.com', '87654321');
  const authUserId = b.authUserId;

  // create Channel1 which isPublic
  const c = channelsCreateV1(authUserId, 'Channel1', true);
  const channelId = c.channelId;

  expect(channelInviteV1(uId, channelId, authUserId)).toStrictEqual({ error: 'error' });
});

describe('Test suite for channelJoinsV1', () => {
  let userId1: number;
  let userId2: number;
  beforeEach(() => {
    userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    userId2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
  });

  afterEach(() => {
    clearV1();
  });

  test('global owner joining channel', () => {
    const channel_id1 = channelsCreateV1(user_id2, 'Gary', false).channelId;
    expect(channelJoinV1(user_id1, channel_id1)).toStrictEqual({});
  });
  
  test('ChannelId not existing', () => {
    expect(channelJoinV1(userId2, -1)).toStrictEqual({ error: 'error' });
  });

  test('Already an existing member of channel', () => {
    const channelId1 = channelsCreateV1(userId1, 'Steve', true).channelId;
    expect(channelJoinV1(userId1, channelId1)).toStrictEqual({ error: 'error' });
  });

  test('Channel is private', () => {
    const channelId1 = channelsCreateV1(userId1, 'Steve', false).channelId;
    expect(channelJoinV1(userId2, channelId1)).toStrictEqual({ error: 'error' });
  });

  test('Joined succesfully', () => {
    const channelId1 = channelsCreateV1(userId1, 'Steve', true).channelId;
    expect(channelJoinV1(userId2, channelId1)).toStrictEqual({});
  });
});

