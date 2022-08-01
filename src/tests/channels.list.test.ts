import { requestRegister, requestLogin, requestChannelsCreate, requestClear, requestChannelsList } from './request';
import { OK, INPUT_ERROR } from './request';

describe('channels path tests', () => {
    let userID : string;
    let token;
    beforeEach(() => {
      requestClear();
      userID = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    });

    test('ChannelsList Successfull', () => {
      requestClear();
      requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
      token = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
      requestChannelsCreate(token, 'Channel1', true);
      expect(requestChannelsList(token).body).toStrictEqual({
        channels: expect.arrayContaining([
          {
            channelId: expect.any(Number),
            name: 'Channel1',
          }
        ])
      });
    });
  
    test('ChannelsList Unsuccessfull', () => {
      expect(requestChannelsList(userID).body).toStrictEqual({
        channels: [],
      });
    });
  });