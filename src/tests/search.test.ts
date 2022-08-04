import { requestSearch, requestChannelsCreate, requestRegister, requestLogin, requestClear, requestDmCreate, requestSendDm, INPUT_ERROR } from './request';

describe('search/v1 tests', () => {
  let token : string;
  let userID : number;
  let userID2 : number;
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
    requestChannelsCreate(token, 'Channel1', true);
    uIds = [userID, userID2];
    dmId = requestDmCreate(token, uIds).body.dmId;
    mId = requestSendDm(token, dmId, 'I love you').body.messageId;
  });

  test('Search/v1 Successfull', () => {
    expect(requestSearch(token, 'love').body).toStrictEqual({
      messages: expect.arrayContaining([
        {
          messageId: mId,
          uId: userID,
          message: 'I love you',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ])
    });
  });

  test('Search/v1 Unsuccessfull', () => {
    expect(requestSearch(token, '').statusCode).toStrictEqual(INPUT_ERROR);
  });
});
