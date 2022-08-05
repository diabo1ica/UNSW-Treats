import { requestRegister, requestLogin, requestChannelsCreate, requestClear, requestChannelRemoveOwner, requestChannelAddowner, requestChannelInvite } from './request';
import { INPUT_ERROR } from './request';

describe('channel path tests', () => {
  let userID2 : number;
  let channelID : number;
  let token : string;
  let token2 : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    userID = obj.body.authUserId;
    const obj2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai')
    userID2 = obj2.body.authUserId;
    token2 = obj2.body.token;
    channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestChannelRemoveOwner(token, channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestChannelRemoveOwner(token, -channelID, userID).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestChannelRemoveOwner(token2, -channelID, userID).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    requestChannelInvite(token, channelID, userID2);
    expect(requestChannelRemoveOwner(token, -channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelRemoveOwner Successfull', () => {
    requestChannelInvite(token, channelID, userID2);
    requestChannelAddowner(token, channelID, userID2);
    expect(requestChannelRemoveOwner(token, channelID, userID2).body).toStrictEqual({});
  });
});
