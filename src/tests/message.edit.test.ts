import { requestClear, requestRegister, requestLogin, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessageEdit, generateMessage } from './request';
import { requestDmCreate, requestSendDm } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite channel for /message/edit/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let manycharacter: string;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
  });

  test('message edited success', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, 'goodbye');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // message is empty string, thus message is deleted
  test('message with empty string deleted success', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, '');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  test('Invalid token', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken1 + '-', messageId, '').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  // user with owner permission channel/global can edit other's message
  test('global/channel owner edit any message success', () => {
    requestChannelJoin(usertoken2, channelId1);
    messageId = requestMessageSend(usertoken2, channelId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, 'goodbye');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // message characters cannot be greatethan 1000
  test('message.length > 1000 (400 error))', () => {
    manycharacter = generateMessage(1230);
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken1, messageId, manycharacter).statusCode).toStrictEqual(INPUT_ERROR);
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('messageId not valid in channels that user has joined (400 error)', () => {
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken2, messageId, 'goodbye').statusCode).toStrictEqual(INPUT_ERROR);
  });

  // the message was not sent by the authorised user making this request and user has not owner permission
  test('not original user who sent the message and has no owner permission (403 error)', () => {
    // user2 trys to edit message sent by user1
    messageId = requestMessageSend(usertoken1, channelId1, 'Helloooo!!!!!').body.messageId;
    requestChannelJoin(usertoken2, channelId1);
    expect(requestMessageEdit(usertoken2, messageId, 'goodbye').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});

describe('Test suite dm for /message/edit/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let userId2: number;
  let usertoken3: string;
  let dmId1: number;
  let manycharacter: string;
  let messageId: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    userId2 = requestLogin('banana@gmail.com', 'banana10').body.authUserId;
    usertoken3 = requestRegister('123abc@gmail.com', '123abc', '123', 'abc').body.token;
    dmId1 = requestDmCreate(usertoken1, [userId2]).body.dmId;
  });

  test('message edited success', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, 'goodbye');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // message is empty string, thus message is deleted
  test('message with empty string deleted success', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, '');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // user with owner permission channel/global can edit other's message
  test('global/dm owner edit any message success', () => {
    messageId = requestSendDm(usertoken2, dmId1, 'Helloooo!!!!!').body.messageId;
    const messageObj = requestMessageEdit(usertoken1, messageId, 'goodbye');
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toStrictEqual({});
  });

  // message characters cannot be greatethan 1000
  test('message.length > 1000 (400 error))', () => {
    manycharacter = generateMessage(1230);
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken1, messageId, manycharacter).statusCode).toStrictEqual(INPUT_ERROR);
  });

  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  test('messageId not valid in channels that user has joined (400 error)', () => {
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken3, messageId, 'goodbye').statusCode).toStrictEqual(INPUT_ERROR);
  });

  // the message was not sent by the authorised user making this request and user has not owner permission
  test('not original user who sent the message and has no owner permission (403 error)', () => {
    // user2 trys to edit message sent by user1
    messageId = requestSendDm(usertoken1, dmId1, 'Helloooo!!!!!').body.messageId;
    expect(requestMessageEdit(usertoken2, messageId, 'goodbye').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
