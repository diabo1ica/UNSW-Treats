import { requestUsersStats, requestChannelsCreate, requestRegister, requestLogin, requestClear } from './request';

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
      channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
    });

    test('users/stats/v1 Successfull', () => {
        expect(requestUsersStats(token).body).toStrictEqual({
          channelsExist: expect.arrayContaining([
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number),
            }
          ]),
          dmsExist: [],
          messagesExist:[],
          utilizationRate: 1,
        });
      });

      test('users/stats/v1 Empty', () => {
        requestClear();
        requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
        const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
        token = obj.body.token;
        expect(requestUsersStats(token).body).toStrictEqual({
          channelsExist: [],
          dmsExist: [],
          messagesExist:[],
          utilizationRate: 0,
        });
      });
});