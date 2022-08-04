import { requestAdminRemove, requestChannelsCreate, requestRegister, requestLogin, requestClear, INPUT_ERROR, requestChannelInvite } from './request';

describe('search/v1 tests', () => {
    let token : string;
    let token2 : string;
    let userID : number;
    let userID2 : number;
    let channelID : number;
    let uIds: number[];
    let dmId: number;
    let mId: number;
    beforeEach(() => {
      requestClear();
      requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
      userID2 = requestRegister('Halo123@gmail.com', 'LetsGo123', 'Andy', 'Alex').body.authUserId;
      const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
      token = obj.body.token;
      userID = obj.body.authUserId;
      channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
      requestChannelInvite(token, channelID, userID2);
    });

    test('adminRemove Error', () => {
      expect(requestAdminRemove(token, userID).statusCode).toStrictEqual(INPUT_ERROR); 
    });
    
});