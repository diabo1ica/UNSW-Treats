import { requestClear, requestRegister, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessageEdit, generateMessage } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite for /message/edit/v1', () => {
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
