import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelMessages, requestChannelsCreate, requestClear, requestDmCreate, requestDmMessages, requestJoinChannel, requestMessagePin, requestRegister, requestSendChannelMessage, requestSendDm } from './request';

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
    requestJoinChannel(user1.token, channelId);
  });

  test('Invalid token', () => {
    expect(requestMessagePin('-' + user1.token, messageId1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid message', () => {
    expect(requestMessagePin(user1.token, messageId1 - 1000).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel', () => {
    expect(requestMessagePin(user2.token, messageId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('User is not a member of the DM', () => {
    expect(requestMessagePin(user3.token, messageId1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Message is already pinned', () => {
    expect(requestMessagePin(user1.token, messageId1).statusCode).toStrictEqual(OK);
    expect(requestMessagePin(user1.token, messageId1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User does not have owner permissions in DM', () => {
    expect(requestMessagePin(user3.token, messageId1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('User does not have owner permissions in Channel', () => {
    expect(requestMessagePin(user1.token, messageId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
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

  test('Pin a message in channel and call channelDetails', () => {
    expect(requestMessagePin(user3.token, messageId2).statusCode).toStrictEqual(OK);
    expect(requestChannelMessages(user1.token, channelId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user3.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true,
      }
    ]);
  });

  test('Pin a message in DM and call dmDetails', () => {
    expect(requestMessagePin(user1.token, messageId1).statusCode).toStrictEqual(OK);
    expect(requestDmMessages(user2.token, dmId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user1.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true,
      }
    ]);
  });
});