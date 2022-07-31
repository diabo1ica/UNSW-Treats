import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

const requestChannelsCreate = (token: string, name: string, isPublic: boolean) => {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        token: token,
        name: name,
        isPublic: isPublic,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelsList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v2',
    {
      qs: {
        token: token,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelInvite = (token: string, channelId: number, uId: number) => {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v2',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestUserProfile = (token: string, uId: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v2',
    {
      qs: {
        token: token,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestRemoveOwner = (token: string, channelId: number, uId: number) => {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestSetname = (token: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setname/v1',
    {
      json: {
        token: token,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestSetemail = (token: string, email: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setemail/v1',
    {
      json: {
        token: token,
        email: email,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

describe('channels path tests', () => {
  let userID : string;
  let token;
  beforeEach(() => {
    requestClear();
    userID = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').token;
  });
  test('ChannelsCreate Successfull', () => {
    expect(requestChannelsCreate(userID, 'Channel1', true)).toStrictEqual(expect.objectContaining({
      channelId: expect.any(Number),
    }));
  });

  test('ChannelsCreate Unsuccessfull', () => {
    expect(requestChannelsCreate(userID, 'Iloveyoubabyandwillmarryyouchannel', true)).toStrictEqual({ error: 'error' });
  });

  test('ChannelsList Successfull', () => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    token = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    requestChannelsCreate(token, 'Channel1', true);
    expect(requestChannelsList(token)).toStrictEqual({
      channels: expect.arrayContaining([
        {
          channelId: expect.any(Number),
          name: 'Channel1',
        }
      ])
    });
  });

  test('ChannelsList Unsuccessfull', () => {
    expect(requestChannelsList(userID)).toStrictEqual({
      channels: [],
    });
  });
});

describe('channel path tests', () => {
  let userID2 : number;
  let channelID : number;
  let token : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.token;
    userID = obj.authUserId;
    userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').authUserId;
    channelID = requestChannelsCreate(token, 'Channel1', true).channelId;
  });

  test('ChannelInvite Successfull', () => {
    expect(requestChannelInvite(token, channelID, userID2)).toStrictEqual({});
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestChannelInvite(token, channelID, -123)).toStrictEqual({ error: 'error' });
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestRemoveOwner(token, channelID, userID)).toStrictEqual({ error: 'error' });
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestRemoveOwner(token, -channelID, userID)).toStrictEqual({ error: 'error' });
  });
});

describe('users path tests', () => {
  let token : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.token;
    userID = obj.authUserId;
  });

  test('UserProfile Successfull', () => {
    expect(requestUserProfile(token, userID)).toStrictEqual({
      user: {
        uId: userID,
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'jingisukan',
      }
    });
  });

  test('UserProfile Unsuccessfull', () => {
    expect(requestUserProfile(token, -321)).toStrictEqual({ error: 'error' });
  });

  test('SetName & SetEmail Successfull', () => {
    requestSetname(token, 'Kennt', 'Alex');
    requestSetemail(token, 'Iloveyou@gmail.com');
    expect(requestUserProfile(token, userID)).toStrictEqual({
      user: {
        uId: userID,
        email: 'Iloveyou@gmail.com',
        nameFirst: 'Kennt',
        nameLast: 'Alex',
        handleStr: 'jingisukan',
      }
    });
  });
});

// Gary's tests
// Delete this if no longer used
const generateMessage = (length: number): string => {
  let message = '';
  for (let i = 0; i < length; i++) {
    message += String.fromCharCode(Math.floor(Math.random() * 26) % 26 + 97);
  }
  return message;
};

const requestClear = () => {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const registerAuth = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestLogin = (email: string, password: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

// Delete this if no longer used

// David's tests
function authlogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

function createChannel(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        token: token,
        name: name,
        isPublic: isPublic,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

function joinChannel(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v2',
    {
      json: {
        token: token,
        channelId: channelId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

function addownerChannel(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/addowner/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function sendMessage(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        message: message,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function editMessage(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/message/edit/v1',
    {
      json: {
        token: token,
        messageId: messageId,
        message: message,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function removeMessage(token: string, messageId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/message/remove/v1',
    {
      qs: {
        token: token,
        messageId: messageId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

const requestUsersAll = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/users/all/v1',
    {
      qs: {
        token: token,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
};

const requestUserSethandle = (token: string, handleStr: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/sethandle/v1',
    {
      json: {
        token: token,
        handleStr: handleStr,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
};

describe('Test suite for /channel/join/v2', () => {
  let usertoken1: string;
  let usertoken2: string;
  let usertoken3: string;
  let channelPublic: number;
  let channelPrivate: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
    usertoken3 = registerAuth('kakarot@gmail.com', 'kakarot10', 'Kakarot', 'Tree').token;
    channelPublic = createChannel(usertoken2, 'AERO1', true).channelId;
    channelPrivate = createChannel(usertoken2, 'AERO2', false).channelId;
  });

  test('channel join (no error)', () => {
    expect(joinChannel(usertoken1, channelPublic)).toStrictEqual({});
  });

  test('channel join (globalperm joining)', () => {
    expect(joinChannel(usertoken1, channelPrivate)).toStrictEqual({});
  });

  test('channel join (invalid channelId)', () => {
    expect(joinChannel(usertoken1, -1)).toStrictEqual({ error: 'error' });
  });

  test('channel join (user already a member of channel)', () => {
    joinChannel(usertoken1, channelPublic);
    expect(joinChannel(usertoken1, channelPublic)).toStrictEqual({ error: 'error' });
  });

  test('channel join (private channel, restricted permission)', () => {
    expect(joinChannel(usertoken3, channelPrivate)).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for /channel/addowner/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let userId2: number;
  let usertoken3: string;
  let channelId1: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
    usertoken3 = registerAuth('kakarot@gmail.com', 'kakarot', 'Kakarot', 'Tree').token;
    userId2 = authlogin('banana@gmail.com', 'banana10').authUserId;
    channelId1 = createChannel(usertoken1, 'AERO1', true).channelId;
  });

  test('channel addowner (no error)', () => {
    joinChannel(usertoken2, channelId1);
    expect(addownerChannel(usertoken1, channelId1, userId2)).toStrictEqual({});
  });

  test('channel addowner (invalid channelId)', () => {
    expect(addownerChannel(usertoken1, -1, userId2)).toStrictEqual({ error: 'error' });
  });

  test('channel addowner (invalid uId)', () => {
    expect(addownerChannel(usertoken1, channelId1, -1)).toStrictEqual({ error: 'error' });
  });

  test('channel addowner (uId is not a member of channel)', () => {
    expect(addownerChannel(usertoken1, channelId1, userId2)).toStrictEqual({ error: 'error' });
  });

  test('channel addowner (uId already owner of channel)', () => {
    joinChannel(usertoken2, channelId1);
    addownerChannel(usertoken1, channelId1, userId2);
    expect(addownerChannel(usertoken1, channelId1, userId2)).toStrictEqual({ error: 'error' });
  });

  test('channel addowner (token/authuser has no owner permission)', () => {
    // making user2 and user 3 member of channel, then user2 attempts to add user3 as owner
    joinChannel(usertoken2, channelId1);
    joinChannel(usertoken3, channelId1);
    expect(addownerChannel(usertoken3, channelId1, userId2)).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for /message/send/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let message: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
    channelId1 = createChannel(usertoken1, 'AERO1', true).channelId;
  });

  test('message send (no error)', () => {
    expect(sendMessage(usertoken1, channelId1, 'GOODMorining')).toEqual({
      messageId: expect.any(Number)
    });
  });

  test('message send (invalid channelId)', () => {
    expect(sendMessage(usertoken1, -1, 'Helloooo!!!!!')).toStrictEqual({ error: 'error' });
  });

  // message characters cannot be greatethan 1000 or lessthan 1
  test('message send (message.length > 1000))', () => {
    message = generateMessage(1200);
    expect(sendMessage(usertoken1, channelId1, message)).toStrictEqual({ error: 'error' });
  });
  test('message send (message.length < 1)', () => {
    expect(sendMessage(usertoken1, channelId1, '')).toStrictEqual({ error: 'error' });
  });

  test('message send (token/user is not a member of channel)', () => {
    expect(sendMessage(usertoken2, channelId1, 'Hi, how are you?')).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for /message/edit/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let manycharacter: string;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
    channelId1 = createChannel(usertoken1, 'AERO1', true).channelId;
  });

  test('message edit (message edited success)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(editMessage(usertoken1, messageId, 'goodbye')).toStrictEqual({});
  });

  // message is empty string, thus message is deleted
  test('message edit (message deleted success)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(editMessage(usertoken1, messageId, '')).toStrictEqual({});
  });

  // message characters cannot be greatethan 1000
  test('message edit (!(message.length > 1000))', () => {
    manycharacter = 'a'.repeat(1500);
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(editMessage(usertoken1, messageId, manycharacter)).toStrictEqual({ error: 'error' });
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('message edit (messageId not valid in channels that user has joined)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(editMessage(usertoken2, messageId, 'goodbye')).toStrictEqual({ error: 'error' });
  });

  // the message was not sent by the authorised user making this request
  test('message edit (not original user who sent the message)', () => {
    // user2 trys to edit message sent by user1
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    joinChannel(usertoken2, channelId1);
    expect(editMessage(usertoken2, messageId, 'goodbye')).toStrictEqual({ error: 'error' });
  });

  // other user's message can be edited by owners of the channel/dm
  test('message edit (user does not have owner permission in channel)', () => {
    // members can only edit their own message
    joinChannel(usertoken2, channelId1);
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(editMessage(usertoken2, messageId, 'goodbye')).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for /message/remove/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
    channelId1 = createChannel(usertoken1, 'AERO1', true).channelId;
  });

  test('message remove (no error)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(removeMessage(usertoken1, messageId)).toStrictEqual({});
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('message remove (messsageId not valid in channels that user has joined)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    expect(removeMessage(usertoken1, -1)).toStrictEqual({ error: 'error' });
  });

  test('message remove (not original user who sent the message)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    joinChannel(usertoken2, channelId1);
    expect(removeMessage(usertoken2, messageId)).toStrictEqual({ error: 'error' });
  });

  // memeber cannot remove other user's message
  test('message remove (does no have owner permission)', () => {
    messageId = sendMessage(usertoken1, channelId1, 'Helloooo!!!!!').messageId;
    joinChannel(usertoken2, channelId1);
    expect(removeMessage(usertoken2, messageId)).toStrictEqual({ error: 'error' });
  });
});

describe('Test suite for /users/all/v1', () => {
  let usertoken1: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
  });

  test('users all (no error)', () => {
    expect(requestUsersAll(usertoken1)).toEqual(expect.objectContaining(
      {
        users: expect.arrayContaining([
          {
            userId: 1,
            email: 'apple@gmail.com',
            nameFirst: 'Apple',
            nameLast: 'Tree',
            handleStr: 'appletree',
          },
          {
            userId: 2,
            email: 'banana@gmail.com',
            nameFirst: 'Banana',
            nameLast: 'Tree',
            handleStr: 'bananatree',
          },
        ])
      }));
  });
});

describe('Test suite for users/profile/sethandle/v1', () => {
  let usertoken1: string;
  let usertoken2: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree').token;
    usertoken2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree').token;
  });

  test('user sethandle (no error)', () => {
    expect(requestUserSethandle(usertoken1, 'SuperMan')).toStrictEqual({});
  });

  test('user sethandle (handle length not inclusive between 3 and 20 characters', () => {
    expect(requestUserSethandle(usertoken1, 'S1')).toStrictEqual({ error: 'error' });
    expect(requestUserSethandle(usertoken1, '123456789101112131415word')).toStrictEqual({ error: 'error' });
  });

  test('user sethandle (contain character that are not alphanumeric)', () => {
    expect(requestUserSethandle(usertoken1, 'abc123~~~~~')).toStrictEqual({ error: 'error' });
  });

  test('user sethandle (handle occupied by another user)', () => {
    // handle 'superman' has being occupied by user2
    requestUserSethandle(usertoken2, 'superman');
    expect(requestUserSethandle(usertoken1, 'superman')).toStrictEqual({ error: 'error' });
  });
});
