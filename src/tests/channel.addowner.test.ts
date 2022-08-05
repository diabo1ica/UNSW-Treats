import { requestClear, requestRegister, requestLogin, requestChannelsCreate, requestChannelJoin, requestChannelAddowner } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite for /channel/addowner/v1', () => {
  let usertoken1: string;
  let usertoken2: string;
  let userId2: number;
  let usertoken3: string;
  let channelId1: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    usertoken3 = requestRegister('kakarot@gmail.com', 'kakarot', 'Kakarot', 'Tree').body.token;
    userId2 = requestLogin('banana@gmail.com', 'banana10').body.authUserId;
    channelId1 = requestChannelsCreate(usertoken1, 'AERO1', true).body.channelId;
  });

  test('route success', () => {
    requestChannelJoin(usertoken2, channelId1);
    const channelObj = requestChannelAddowner(usertoken1, channelId1, userId2);
    expect(channelObj.statusCode).toStrictEqual(OK);
    expect(channelObj.body).toStrictEqual({});
  });

  test('invalid channelId (400 error)', () => {
    expect(requestChannelAddowner(usertoken1, -1, userId2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Invalid token', () => {
    requestChannelJoin(usertoken2, channelId1);
    expect(requestChannelAddowner('-' + usertoken1, channelId1, userId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('invalid uId (400 error)', () => {
    expect(requestChannelAddowner(usertoken1, channelId1, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('uId is not a member of channel (400 error)', () => {
    expect(requestChannelAddowner(usertoken1, channelId1, userId2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('uId already owner of channel (400 error)', () => {
    requestChannelJoin(usertoken2, channelId1);
    requestChannelAddowner(usertoken1, channelId1, userId2);
    expect(requestChannelAddowner(usertoken1, channelId1, userId2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('authuser has no owner permission (403 error)', () => {
    // making user2 and user 3 member of channel, then user2 attempts to add user3 as owner
    requestChannelJoin(usertoken2, channelId1);
    requestChannelJoin(usertoken3, channelId1);
    expect(requestChannelAddowner(usertoken3, channelId1, userId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
