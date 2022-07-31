import { requestClear, requestRegister, requestChannelsCreate, requestChannelInvite, requestChannelDetails, requestChannelLeave } from './request';
// import { OK, INPUT_ERROR } from './request';

describe('channel leave tests', () => {
  requestClear();
  test('Test Channel Leave', () => {
    const userToken: string = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    const channelId: number = requestChannelsCreate(userToken, 'Xhorhas', true).body.channelId;
    const bodyObj = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    const token1: string = bodyObj.token;
    const userId1: number = bodyObj.authUserId;
    const userId2: number = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    const userId3: number = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    const token2: string = requestRegister('z6789654@unsw.edu.au', 'aero897', 'Arlong', 'Hui').body.token;
    requestChannelInvite(userToken, channelId, userId1);
    requestChannelInvite(userToken, channelId, userId2);
    requestChannelInvite(userToken, channelId, userId3);
    expect(requestChannelLeave(userToken, channelId - 100).body).toStrictEqual({ error: 'error' });
    expect(requestChannelLeave(userToken, channelId).body).toStrictEqual({});
    expect(requestChannelLeave(token2, channelId).body).toStrictEqual({ error: 'error' });
    expect(requestChannelDetails(token1, channelId).body).toStrictEqual({
      name: 'Xhorhas',
      isPublic: true,
      ownerMembers: [],
      allMembers: [{
        uId: expect.any(Number),
        email: 'z3329234@unsw.edu.au',
        nameFirst: 'Gary',
        nameLast: 'Ang',
        handleStr: 'garyang'
      },
      {
        uId: expect.any(Number),
        email: 'z1319832@unsw.edu.au',
        nameFirst: 'Kenneth',
        nameLast: 'Kuo',
        handleStr: 'kennethkuo'
      },
      {
        uId: expect.any(Number),
        email: 'z4234824@unsw.edu.au',
        nameFirst: 'David',
        nameLast: 'Pei',
        handleStr: 'davidpei'
      }]
    });
  });
});
