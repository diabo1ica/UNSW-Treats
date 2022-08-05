import { requestClear, requestRegister, requestChannelsCreate, requestDmCreate, requestNotifications, requestChannelInvite } from './request';
import { requestSendChannelMessage, requestSendDm, requestMessageReact, requestMessageEdit, AUTHORISATION_ERROR } from './request';
import { THUMBSUP } from '../dataStore';

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
    channelId = requestChannelsCreate(tokenId1, 'Xhorhas', true).body.channelId;
  });

  test('Test invalid token', () => {
    requestChannelInvite(tokenId1, channelId, uId2);
    expect(requestNotifications('Hiyahiya').statusCode).toStrictEqual(AUTHORISATION_ERROR);
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
    const messageStr = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
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
    const messageStr = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
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

  test('Test react notif in channel', () => {
    const messageStr = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
    requestChannelInvite(tokenId1, channelId, uId2);
    const messageId = requestSendChannelMessage(tokenId1, channelId, messageStr).body.messageId;
    requestMessageReact(tokenId2, messageId, THUMBSUP);
    expect(requestNotifications(tokenId1).body).toStrictEqual([
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: 'suske reacted to your message in Xhorhas'
      }
    ]);
  });

  test('Test react notif in Dm', () => {
    const messageStr = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
    const dmId = requestDmCreate(tokenId1, [uId2]).body.dmId;
    const messageId = requestSendDm(tokenId1, dmId, messageStr).body.messageId;
    requestMessageReact(tokenId2, messageId, THUMBSUP);
    expect(requestNotifications(tokenId1).body).toStrictEqual([
      {
        channelId: -1,
        dmId: dmId,
        notificationMessage: 'suske reacted to your message in jingisukan, suske'
      }
    ]);
  });

  test('Test message edit', () => {
    const messageStr = 'Ajo @suske red dahlia be venting 24/7 morbussin all over the place';
    const messageStr2 = 'Ajo @suske thegreat@jingisukan be venting 24/7 morbussin all over the place';
    // Channel test
    requestChannelInvite(tokenId1, channelId, uId2);
    const messageId = requestSendChannelMessage(tokenId1, channelId, messageStr).body.messageId;
    requestMessageEdit(tokenId1, messageId, messageStr2);
    // Dm test
    const dmId = requestDmCreate(tokenId1, [uId2]).body.dmId;
    const messageId2 = requestSendDm(tokenId1, dmId, messageStr).body.messageId;
    requestMessageEdit(tokenId1, messageId2, messageStr2);
    requestMessageEdit(tokenId1, messageId2, messageStr);
    expect(requestNotifications(tokenId1).body).toStrictEqual([
      {
        channelId: -1,
        dmId: dmId,
        notificationMessage: 'jingisukan tagged you in jingisukan, suske: Ajo @suske thegreat@'
      },
      {
        channelId: channelId,
        dmId: -1,
        notificationMessage: 'jingisukan tagged you in Xhorhas: Ajo @suske thegreat@'
      }
    ]);
  });
});
