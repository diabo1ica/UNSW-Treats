import { requestSearch, requestChannelsCreate, requestRegister, requestLogin, requestClear, requestDmCreate, requestSendDm, INPUT_ERROR } from './request';

describe('search/v1 tests', () => {
  let token : string;
  let userID : number;
  let userID2 : number;
  let channelID : number;
  let uIds: number[];
  let dmId: number;
  let mId: number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    userID = obj.body.authUserId;
    userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').body.authUserId;
    channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
    uIds = [userID, userID2];
    dmId = requestDmCreate(token, uIds).body.dmId;
    mId = requestSendDm(token, dmId, 'I love you').body.messageId;
  });

  test('Search/v1 Successfull', () => {
    expect(requestSearch(token, 'love').body).toStrictEqual(expect.objectContaining(
      {
        messageId: mId,
        uId: expect.any(Number),
        message: 'I love you',
        timeSent: expect.any(Number),
        reacts: '',
        isPinned: true
      }
    ));
  });

  test('Search/v1 Unsuccessfull', () => {
    expect(requestSearch(token, 'Channel').statusCode).toStrictEqual(INPUT_ERROR);
  });
});