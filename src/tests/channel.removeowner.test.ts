import { requestRegister, requestLogin, requestChannelsCreate, requestClear, requestChannelRemoveOwner } from './request';
import { INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('channel path tests', () => {
    let userID2 : number;
    let channelID : number;
    let token : string;
    let userID : number;
    beforeEach(() => {
      requestClear();
      requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
      const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
      token = obj.body.token;
      userID = obj.body.authUserId;
      userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').body.authUserId;
      channelID = requestChannelsCreate(token, 'Channel1', true).body.channelId;
    });
  
    test('ChannelRemoveOwner Unsuccessfull', () => {
      expect(requestChannelRemoveOwner(token, channelID, userID2).statusCode).toStrictEqual(INPUT_ERROR);
    });
  
    test('ChannelRemoveOwner Unsuccessfull', () => {
      expect(requestChannelRemoveOwner(token, -channelID, userID).statusCode).toStrictEqual(INPUT_ERROR);
    });
  });