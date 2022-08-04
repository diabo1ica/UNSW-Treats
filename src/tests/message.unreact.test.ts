import { THUMBSUP } from '../dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelMessages, requestChannelsCreate, requestClear, requestDmCreate, requestDmMessages } from './request';
import { requestChannelJoin, requestMessageReact, requestMessageUnreact, requestRegister, requestMessageSend, requestSendDm } from './request';

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
    messageId2 = requestMessageSend(user3.token, channelId, 'PIN ME TOO').body.messageId;
    requestChannelJoin(user1.token, channelId);
    requestMessageReact(user1.token, messageId1, THUMBSUP);
  });

  test('Invalid token', () => {
    expect(requestMessageUnreact('-' + user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid message', () => {
    expect(requestMessageUnreact(user1.token, messageId1 - 1000, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Invalid React', () => {
    expect(requestMessageUnreact(user1.token, messageId1, THUMBSUP + 3).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel', () => {
    expect(requestMessageUnreact(user2.token, messageId2, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('User is not a member of the DM', () => {
    expect(requestMessageUnreact(user3.token, messageId1, THUMBSUP).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('The user has not used react ID for a message in DM', () => {
    expect(requestMessageUnreact(user2.token, messageId1, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('The user has not react ID for a message in channel', () => {
    expect(requestMessageUnreact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(INPUT_ERROR);
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
    messageId2 = requestMessageSend(user3.token, channelId, 'PIN ME TOO').body.messageId;
    requestChannelJoin(user1.token, channelId);
    requestMessageReact(user1.token, messageId1, THUMBSUP);
  });

  test('unreact in DM', () => {
    expect(requestMessageUnreact(user1.token, messageId1, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestDmMessages(user2.token, dmId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user1.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: [],
          isThisUserReacted: false
        }],
        isPinned: false
      },
    ]);
  });

  test('unreact in channel', () => {
    expect(requestMessageUnreact(user3.token, messageId2, THUMBSUP).statusCode).toStrictEqual(OK);
    expect(requestChannelMessages(user1.token, channelId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user3.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [{
          reactId: THUMBSUP,
          uIds: expect.arrayContaining([]),
          isThisUserReacted: false
        }],
        isPinned: false
      }
    ]);
  });
});
