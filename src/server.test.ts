import { profile } from 'console';
import { token } from 'morgan';
import { send } from 'process';
import { stringify } from 'querystring';
import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;


function registerAuth(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
          SERVER_URL + `/auth/register/v2`,
          {
            json: {
              email: email,
              password: password,
              nameFirst: nameFirst,
              nameLast: nameLast
            }
          }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

function createChannel(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
          SERVER_URL + `/channels/create/v2`,
          {
              json: {
                token: token,
                name: name,
                isPublic: isPublic,
              }
          }
  )
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

function joinChannel(token: string, channelId: number) {
  const res = request(
    'POST',
          SERVER_URL + `/channels/join/v2`,
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
          SERVER_URL + `/channel/addowner/v1`,
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

function sendMessage(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
          SERVER_URL + '/message/send/v1',
          {
            json: {
              token: token,
              channelId: channelId,
              message: "helloo!!!"
            }
          }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
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
  return JSON.parse(res.getBody() as string);
}

function removeMessage(token: string, messageId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + `/message/remove/v1`,
    {
      qs: {
        token: token,
        messageId: messageId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestUsersAll = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/users/all/v2',
    {
      qs: {
        token: token,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
}

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
  return JSON.parse(res.getBody() as string);
};

function requestClear() {
  request(
    'DELETE',
    SERVER_URL + `/clear/v1`,
    {
      qs: {}
    }
  );
};

describe('Test suite for /channel/join/v2', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel_public: any;
  let channel_private: any;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    user3 = registerAuth('kakarot@gmail.com', 'kakarot10', 'Kakarot', 'Tree');
    channel_public = createChannel(user2.token, 'AERO1', true);
    channel_private = createChannel(user2.token, 'AERO2', false);
  });

  test('channel join (no error)', () => {
    expect(joinChannel(user1.token, channel_public.channelId)).toStrictEqual({});
  });

  test('channel join (globalperm joining)', () => {
    expect(joinChannel(user1.token, channel_private.channelId)).toStrictEqual({});
  });

  test('channel join (invalid channelId)', () => {
    expect(joinChannel(user1.token, -1)).toStrictEqual({error: 'error'});
  });

  test('channel join (user already a member of channel)', () => {
    joinChannel(user1.token, channel_public.channelId)
    expect(joinChannel(user1.token, channel_public.channelId)).toStrictEqual({error: 'error'});
  });

  test('channel join (private channel, restricted permission)', () => {
    expect(joinChannel(user3.token, channel_private.channelId)).toStrictEqual({error: 'error'});
  });

});

describe('Test suite for /channel/addowner/v1', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let channel1: any;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    user3 = registerAuth('kakarot@gmail.com', 'kakarot10', 'Kakarot', 'Tree');
    channel1 = createChannel(user1.token, 'AERO1', true);
  });

  test('channel addowner (no error)', () => {
    joinChannel(user2.token, channel1.channelId);
    expect(addownerChannel(user1.token, channel1.channelId, user2.userId)).toStrictEqual({});
  });

  test('channel addowner (invalid channelId)', () => {
    expect(addownerChannel(user1.token, -1, user2.userId)).toStrictEqual({error: 'error'});
  });

  test('channel addowner (invalid uId)', () => {
    expect(addownerChannel(user1.token, channel1.channelId, -1)).toStrictEqual({error: 'error'});
  });

  test('channel addowner (uId is not a member of channel)', () => {
    expect(addownerChannel(user1.token, channel1.channelId, user2.userId)).toStrictEqual({error: 'error'});
  });

  test('channel addowner (uId already owner of channel)', () => {
    joinChannel(user2.token, channel1.channelId);
    addownerChannel(user1.token, channel1.channelId, user2.userId)
    expect(addownerChannel(user1.token, channel1.channelId, user2.userId)).toStrictEqual({error: 'error'});
  });

  test('channel addowner (token/authuser has no owner permission)', () => {
    // making user2 and user 3 member of channel, then user2 attempts to add user3 as owner
    joinChannel(user2.token, channel1.channelId);
    joinChannel(user3.token, channel1.channelId);
    expect(addownerChannel(user2.token, channel1.channelId, user3.userId)).toStrictEqual({error: 'error'});
  });

});

describe('Test suite for /message/send/v1', () => {
  let user1: any;
  let user2: any;
  let channel1: any;
  let manycharacter: string;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    channel1 = createChannel(user1.token, 'AERO1', true);
  });

  test('message send (no error)', () => {
    expect(sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!')).toEqual({
      messageId: expect.any(Number)
    });
  });

  test('message send (invalid channelId)', () => {
    expect(sendMessage(user1.token, -1, 'Helloooo!!!!!')).toStrictEqual({error: 'error'});
  });

  // message characters cannot be greatethan 1000 or lessthan 1
  test('message send (!(message.length > 1000) || !(message.length < 1))', () => {
    manycharacter = 'a'.repeat(1001);
    expect(sendMessage(user1.token, channel1.channelId, '')).toStrictEqual({error: 'error'});
    expect(sendMessage(user1.token, channel1.channelId, manycharacter)).toStrictEqual({error: 'error'});
  });

  test('message send (token/user is not a member of channel)', () => {
    expect(sendMessage(user2.token, channel1.channelId, 'Hi, how are you?')).toStrictEqual({error: 'error'});
  });

});

describe('Test suite for /message/edit/v1', () => {
  let user1: any;
  let user2: any;
  let channel1: any;
  let manycharacter: string;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    channel1 = createChannel(user1.token, 'AERO1', true);
  });

  test('message edit (message edited success)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(editMessage(user1.token, messageId, 'goodbye')).toStrictEqual({});
  });

  // message is empty string, thus message is deleted
  test('message edit (message deleted success)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(editMessage(user1.token, messageId, '')).toStrictEqual({});
  });

  // message characters cannot be greatethan 1000
  test('message edit (!(message.length > 1000))', () => {
    manycharacter = 'a'.repeat(1001);
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(editMessage(user1.token, messageId, manycharacter)).toStrictEqual({error: 'error'});
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('message edit (messageId not valid in channels that user has joined)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(editMessage(user2.token, messageId, 'goodbye')).toStrictEqual({error: 'error'});
  });

  // the message was not sent by the authorised user making this request
  test('message edit (not original user who sent the message)', () => {
    // user2 trys to edit message sent by user1
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    joinChannel(user2.token, channel1.channelId);
    addownerChannel(user1.token, channel1.channelId, user2.userId)
    expect(editMessage(user2.token, messageId, 'goodbye')).toStrictEqual({error: 'error'});
  });

  // other user's message can be edited by owners of the channel/dm
  test('message edit (user does not have owner permission in channel)', () => {
    // members can only edit their own message
    joinChannel(user2.token, channel1.channelId);
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(editMessage(user2.token, messageId, 'goodbye')).toStrictEqual({error: 'error'});
  });

});

describe('Test suite for /message/remove/v1', () => {
  let user1: any;
  let user2: any;
  let channel1: any;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    channel1 = createChannel(user1.token, 'AERO1', true);
  });

  test('message remove (no error)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(removeMessage(user1.token, messageId)).toStrictEqual({});
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('message remove (messsageId not valid in channels that user has joined)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    expect(removeMessage(user1.token, -1)).toStrictEqual({error: 'error'});
  });

  test('message remove (not original user who sent the message)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    joinChannel(user2.token, channel1.channelId);
    expect(removeMessage(user2.token, messageId)).toStrictEqual({error: 'error'});
  });

  // memeber cannot remove other user's message
  test('message remove (does no have owner permission)', () => {
    messageId = sendMessage(user1.token, channel1.channelId, 'Helloooo!!!!!').messageId;
    joinChannel(user2.token, channel1.channelId);
    expect(removeMessage(user2.token, messageId)).toStrictEqual({error: 'error'});
  });

});

describe('Test suite for /users/all/v1', () => {
  let user1: any;
  let user2: any;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
  });

  test('users all (no error)', () => {
    expect(requestUsersAll(user1.token)).toStrictEqual(expect.objectContaining(
      {
        users: expect.arrayContaining([
          {
            uId: expect.any(Number),
            email: 'apple@gmail.com',
            nameFirst: 'Apple',
            nameLast: 'Tree',
            handleStr: expect.any(String),
          },
          {
            uId: expect.any(Number),
            email: 'banana@gmail.com',
            nameFirst: 'Banana',
            nameLast: 'Tree',
            handleStr: expect.any(String),
          },
        ])
      }));
  });

});

describe('Test suite for users/profile/sethandle/v1', () => {
  let user1: any;
  let user2: any;

  beforeEach(() => {
    requestClear();
    user1 = registerAuth('apple@gmail.com', 'apple10', 'Apple', 'Tree');
  });

  test('user sethandle (no error)', () => {
    expect(requestUserSethandle(user1.token, 'SuperMan')).toStrictEqual({});
  });

  test('user sethandle (handle length not inclusive between 3 and 20 characters', () => {
    expect(requestUserSethandle(user1.token, 'S1')).toStrictEqual({error: 'error'});
    expect(requestUserSethandle(user1.token, '123456789101112131415word')).toStrictEqual({error: 'error'});
  });

  test('user sethandle (contain character that are not alphanumeric)', () => {
    expect(requestUserSethandle(user1.token, 'abc123~~~~~')).toStrictEqual({error: 'error'});
  });

  test('user sethandle (handle occupied by another user)', () => {
    // handle 'superman' has being occupied by user2
    user2 = registerAuth('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    requestUserSethandle(user2.token, 'superman');
    expect(requestUserSethandle(user1.token, 'SuperMan')).toStrictEqual({error: 'error'});
  });

});

