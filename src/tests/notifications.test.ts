import { requestClear, requestRegister, requestChannelsCreate, requestDmCreate, requestNotifications, requestChannelInvite,  } from './request';
import { requestSendChannelMessage, requestSendDm } from './request';
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
    const user2 = requestRegister('suskemogus@unsw.edu.au', 'iswearhevented', 'sus', 'ke').body;
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

  test('Test tag notif in channel', () => {
    const messageStr: string = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
    requestChannelInvite(tokenId1, channelId, uId2);
    requestSendChannelMessage(tokenId1, channelId, messageStr);
    expect(requestNotifications(tokenId2).body).toStrictEqual([
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: 'jingisukan tagged you in Xhorhas: Ajo @suske red dahli'
      },
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: 'jingisukan added you to Xhorhas'
      }
    ]);
  });

  test('Test tag notif in dm', () => {
    const messageStr: string = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
    const dmId = requestDmCreate(tokenId1, [uId2]).body.dmId;
    requestSendDm(tokenId1, dmId, messageStr);
    expect(requestNotifications(tokenId2).body).toStrictEqual([
      {
        channelId: -1,
        dmId: dmId,
        notificationMessage: 'jingisukan tagged you in jingisukan, suske: Ajo @suske red dahli'
      },
      {
        channelId: -1,
        dmId: dmId,
        notificationMessage: 'jingisukan added you to jingisukan, suske'
      }
    ]);
  });
});