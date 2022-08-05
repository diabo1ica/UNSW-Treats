import { requestClear, requestRegister, requestChannelsCreate, requestSendChannelMessage, generateMessage } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite for /message/send/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;
  let message: string;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
  });

  test('route success', () => {
    const messageObj = requestSendChannelMessage(usertoken1, channelId1, 'GOODMorining');
    expect(messageObj.statusCode).toEqual(OK);
    expect(messageObj.body).toEqual({
      messageId: expect.any(Number)
    });
  });

  test('Invalid token', () => {
    expect(requestMessageSend('-' + usertoken1, channelId1, 'GOODMorining').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('invalid channelId (400 error)', () => {
    const messageObj = requestSendChannelMessage(usertoken1, -1, 'Helloooo!!!!!');
    expect(messageObj.statusCode).toStrictEqual(INPUT_ERROR);
  });

  // message characters cannot be greatethan 1000 or lessthan 1
  test('message.length > 1000 (400 error)', () => {
    message = generateMessage(1200);
    expect(requestSendChannelMessage(usertoken1, channelId1, message).statusCode).toStrictEqual(INPUT_ERROR);
  });
  test('message.length < 1 (400 error)', () => {
    expect(requestSendChannelMessage(usertoken1, channelId1, '').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('token/user is not a member of channel (403 error)', () => {
    expect(requestSendChannelMessage(usertoken2, channelId1, 'Hi, how are you?').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
