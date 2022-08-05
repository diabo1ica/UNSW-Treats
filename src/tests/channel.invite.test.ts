import { requestClear, requestRegister, requestLogin, requestChannelsCreate, requestChannelInvite, INPUT_ERROR, requestChannelLeave } from './request';

describe('channel path tests', () => {
  let userID2 : number;
  let channelID : number;
  let token : string;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').body.authUserId;
    channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
  });

  test('ChannelInvite Successfull', () => {
    expect(requestChannelInvite(token, channelID, userID2).body).toStrictEqual({});
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestChannelInvite(token, channelID, -123).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestChannelInvite(token, -channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelInvite Unsuccessfull', () => {
    requestChannelInvite(token, channelID, userID2);
    expect(requestChannelInvite(token, channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('ChannelInvite Unsuccessfull', () => {
    requestChannelInvite(token, channelID, userID2);
    requestChannelLeave(token, channelID);
    expect(requestChannelInvite(token, channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
  });
});
