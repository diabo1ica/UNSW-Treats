import { requestClear, requestRegister, requestLogin, requestChannelsCreate, requestMessageSend, generateMessage, requestMessageShare } from './request';
import { requestDmCreate, requestSendDm } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('test suite for /message/share/v1', () => {
  let usertoken1: string;
  let usertoken3: string;
  let userId2: number;
  let channelId1: number;
  let dmId1: number;
  let messageIdCh: number;
  let messageIdDm: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree');
    usertoken3 = requestRegister('123abc@gmail.com', '123abc', '123', 'abc').body.token;
    userId2 = requestLogin('banana@gmail.com', 'banana10').body.authUserId;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
    dmId1 = requestDmCreate(usertoken1, [userId2]).body.dmId;
    messageIdCh = requestMessageSend(usertoken1, channelId1, generateMessage(5)).body.messageId;
    messageIdDm = requestSendDm(usertoken1, channelId1, generateMessage(5)).body.messageId;
  });

  test('success in channel', () => {
    const messageObj = requestMessageShare(usertoken1, messageIdCh, generateMessage(5), -1, dmId1);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toEqual({
      sharedMessageId: expect.any(Number)
    });
  });

  test('success in dm', () => {
    const messageObj = requestMessageShare(usertoken1, messageIdDm, generateMessage(5), channelId1, -1);
    expect(messageObj.statusCode).toStrictEqual(OK);
    expect(messageObj.body).toEqual({
      sharedMessageId: expect.any(Number)
    });
  });

  test('Invalid token', () => {
    expect(requestMessageShare('-' + usertoken1, messageIdDm, generateMessage(5), channelId1, -1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid channelId (400 error)', () => {
    expect(requestMessageShare(usertoken1, messageIdDm, generateMessage(5), channelId1 - 1000, -1).statusCode).toStrictEqual(INPUT_ERROR);
    expect(requestMessageShare(usertoken1, messageIdCh, generateMessage(5), channelId1 - 1000, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Invalid dmId (400 error)', () => {
    expect(requestMessageShare(usertoken1, messageIdCh, generateMessage(5), -1, dmId1 - 1000).statusCode).toStrictEqual(INPUT_ERROR);
    expect(requestMessageShare(usertoken1, messageIdDm, generateMessage(5), -1, dmId1 - 1000).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('neither dmId or channelId is -1 (400 error)', () => {
    expect(requestMessageShare(usertoken1, messageIdCh, generateMessage(5), channelId1, dmId1).statusCode).toStrictEqual(INPUT_ERROR);
    expect(requestMessageShare(usertoken1, messageIdDm, generateMessage(5), channelId1, dmId1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('optional message.length > 1000 (400 error)', () => {
    expect(requestMessageShare(usertoken1, messageIdDm, generateMessage(1020), channelId1, -1).statusCode).toStrictEqual(INPUT_ERROR);
    expect(requestMessageShare(usertoken1, messageIdCh, generateMessage(1020), -1, dmId1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('invalid ogMessageId (400 error)', () => {
    expect(requestMessageShare(usertoken1, -999, generateMessage(5), channelId1, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel (403 error)', () => {
    expect(requestMessageShare(usertoken3, messageIdCh, generateMessage(5), channelId1, -1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('User is not a member of the dm (403 error)', () => {
    expect(requestMessageShare(usertoken3, messageIdCh, generateMessage(5), -1, dmId1).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
