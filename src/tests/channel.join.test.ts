import { requestClear, requestRegister, requestChannelsCreate, requestChannelJoin } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('Test suite for /channel/join/v2', () => {
  let usertoken1: string;
  let usertoken2: string;
  let usertoken3: string;
  let channelPublic: number;
  let channelPrivate: number;

  beforeEach(() => {
    requestClear();
    usertoken1 = requestRegister('apple@gmail.com', 'apple10', 'Apple', 'Tree').body.token;
    usertoken2 = requestRegister('banana@gmail.com', 'banana10', 'Banana', 'Tree').body.token;
    usertoken3 = requestRegister('kakarot@gmail.com', 'kakarot10', 'Kakarot', 'Tree').body.token;
    channelPublic = requestChannelsCreate(usertoken2, 'AERO1', true).body.channelId;
    channelPrivate = requestChannelsCreate(usertoken2, 'AERO2', false).body.channelId;
  });

  test('success', () => {
    const channelObj = requestChannelJoin(usertoken1, channelPublic);
    expect(channelObj.statusCode).toStrictEqual(OK);
    expect(channelObj.body).toStrictEqual({});
  });

  test('globalpermision joining', () => {
    const channelObj = requestChannelJoin(usertoken1, channelPrivate);
    expect(channelObj.statusCode).toStrictEqual(OK);
    expect(channelObj.body).toStrictEqual({});
  });

  test('invalid channelId (400 error)', () => {
    expect(requestChannelJoin(usertoken1, -1).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('user already a member of channel (400 error)', () => {
    requestChannelJoin(usertoken1, channelPublic);
    expect(requestChannelJoin(usertoken1, channelPublic).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('private channel, restricted permission (403 error)', () => {
    expect(requestChannelJoin(usertoken3, channelPrivate).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
