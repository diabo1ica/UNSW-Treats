import { requestClear, requestRegister, requestChannelsCreate, requestMessageSendlater, generateMessage } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';
import { getCurrentTime } from '../util';

const time = 10;

describe('test suite for /message/sendlater/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let channelId1: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
  });

  test('success', () => {
    const messageObj = requestMessageSendlater(usertoken1, channelId1, generateMessage(4), getCurrentTime() + time);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toEqual({
      messageId: expect.any(Number)
    });
  });

  test('Invalid token', () => {
    expect(requestMessageSendlater('-' + usertoken1, channelId1, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid channelId (400 error)', () => {
    expect(requestMessageSendlater(usertoken1, -1, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('message.length > 1000 (400 error)', () => {
    expect(requestMessageSendlater(usertoken1, channelId1, generateMessage(1100), getCurrentTime() + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('message.length < 1 (400 error)', () => {
    expect(requestMessageSendlater(usertoken1, channelId1, generateMessage(0), getCurrentTime() + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('message sent to past time (400 error)', () => {
    expect(requestMessageSendlater(usertoken1, channelId1, generateMessage(4), getCurrentTime() - 100).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel (403 error)', () => {
    expect(requestMessageSendlater(usertoken2, channelId1, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
