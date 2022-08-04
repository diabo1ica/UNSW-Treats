import { requestClear, requestRegister, requestLogin, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessageRemove } from './request';
import { requestDmCreate, requestSendDm } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite channel for /message/remove/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
  });

  test('message remove success', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageRemove(usertoken1, messageId);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // user with owner permission can remove any message
  test('message remove success by owners', () => {
    requestChannelJoin(usertoken2, channelId1);
    messageId = requestMessageSend(usertoken2, channelId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageRemove(usertoken1, messageId);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('invalid messageId for user (400 error)', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageRemove(usertoken1, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  // user that is a member cannot remove other's message
  test('not original user who sent the message (403 error)', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    requestChannelJoin(usertoken2, channelId1);
    expect(requestMessageRemove(usertoken2, messageId).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});

describe('Test suite dm for /message/remove/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let userId2: number;
  let dmId1: number;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    userId2 = requestLogin('banana@gmail.com', 'banana10').body.authUserId;
    dmId1 = requestDmCreate(usertoken1, [userId2]).body.channelId;
  });

  test('message remove success', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageRemove(usertoken1, messageId);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // user with owner permission can remove any message
  test('message remove success by owners', () => {
    messageId = requestSendDm(usertoken2, dmId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageRemove(usertoken1, messageId);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('invalid messageId for user (400 error)', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageRemove(usertoken1, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  // user that is a member cannot remove other's message
  test('not original user who sent the message (403 error)', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageRemove(usertoken2, messageId).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
