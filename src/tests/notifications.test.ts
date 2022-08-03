import { requestClear, requestRegister, requestChannelsCreate, requestDmCreate, requestNotifications, requestChannelInvite } from './request';
import { OK, AUTHORISATION_ERROR } from './request';

describe('Notification tests', () => {
  // Dm variables
  let tokenId1: string;
  let tokenId2: string;
  let uId2: number;
  // let uId3: number;

  // Channel variables
  let channelId: number;

  beforeEach(() => {
    requestClear();
    tokenId1 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    const user2 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body;
    uId2 = user2.authUserId;
    tokenId2 = user2.token;
    // uId3 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    channelId = requestChannelsCreate(tokenId1, 'Xhorhas', true).body.channelId;
  });

  test('Test channel invite notif', () => {
    requestChannelInvite(tokenId1, channelId, uId2);
    expect(requestNotifications(tokenId2).body).toStrictEqual([{
      channelId: channelId,
      dmId: -1,
      notificationMessage: 'jingisukan added you to Xhorhas'
    }]);
  });

  test('Test dm invite notif', () => {
    const dmId = requestDmCreate(tokenId1, [uId2]).body.dmId;
    expect(requestNotifications(tokenId2).body).toStrictEqual([{
      channelId: -1,
      dmId: dmId,
      notificationMessage: expect.any(String)
    }]);
  });

});