import { THUMBSUP } from '../dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelMessages, requestChannelsCreate, requestClear, requestDmCreate, requestDmMessages, requestJoinChannel, requestMessagePin, requestMessageReact, requestRegister, requestSendChannelMessage, requestSendDm } from './request';

let user1: any, user2: any, user3: any;
let dmId: number;
let channelId: number;
let messageId1: number, messageId2: number;
describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    user1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body;
    user2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    user3 = requestRegister('z5363442@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body;
    dmId = requestDmCreate(user1.token, [user2.authUserId]).body.dmId;
    channelId = requestChannelsCreate(user3.token, 'AERO', true).body.channelId;
    messageId1 = requestSendDm(user1.token, dmId, 'PIN ME').body.messageId;
    messageId2 = requestSendChannelMessage(user3.token, channelId, 'PIN ME TOO').body.messageId;
  });

  test('Invalid token', () => {
    expect(requestMessageReact('-' + user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid message', () => {
    expect(requestMessageReact(user1.token, messageId1 - 1000, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Invalid React', () => {
    expect(requestMessageReact(user1.token, messageId1, THUMBSUP + 3).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel', () => {
    expect(requestMessageReact(user2.token, messageId2, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('User is not a member of the DM', () => {
    expect(requestMessageReact(user3.token, messageId1, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('The user has already used the react ID for a message in DM', () => {
    expect(requestMessageReact(user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestMessageReact(user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('The user has already used the react ID for a message in channel', () => {
    expect(requestMessageReact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestMessageReact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    user1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body;
    user2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    user3 = requestRegister('z5363442@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body;
    dmId = requestDmCreate(user1.token, [user2.authUserId]).body.dmId;
    channelId = requestChannelsCreate(user3.token, 'AERO', true).body.channelId;
    messageId1 = requestSendDm(user1.token, dmId, 'PIN ME').body.messageId;
    messageId2 = requestSendChannelMessage(user3.token, channelId, 'PIN ME TOO').body.messageId;
    requestJoinChannel(user1.token, channelId);
  });

   test('2 users react to a message in DM', () => {
    expect(requestMessageReact(user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestMessageReact(user2.token, messageId1, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestDmMessages(user2.token, dmId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user1.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: [user1.authUserId, user2.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      },
    ]);
  });

  test('2 users react to a pinned message in channel', () => {
    expect(requestMessageReact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestMessageReact(user1.token, messageId2, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestMessagePin(user3.token, messageId2).statusCode).toStrictEqual(OK);
    expect(requestChannelMessages(user1.token, channelId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user3.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: expect.arrayContaining([user1.authUserId, user3.authUserId]),
          isThisUserReacted: true
        }],
        isPinned: true
      }
    ])
  });

  test('1 user reacts to a message in channel (member who hasn\'t reacted calls channelDetails)', () => {
    expect(requestMessageReact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestChannelMessages(user1.token, channelId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user3.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: [user3.authUserId],
          isThisUserReacted: false
        }],
        isPinned: false
      }
    ])
  });
  
  test('1 user reacts to message in DM (member who hasn\'t reacted calls dmDetails)', () => {
    expect(requestMessageReact(user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestDmMessages(user2.token, dmId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user1.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: [user1.authUserId],
          isThisUserReacted: false
        }],
        isPinned: false
      },
    ]);
  });
});
