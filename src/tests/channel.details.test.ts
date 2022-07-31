import { requestClear, requestRegister, requestLogout, requestChannelsCreate, requestChannelDetails } from './request';
// import { OK, INPUT_ERROR } from './request';

describe('channel details tests', () => {
  let userToken: string;
  let channelId: number;
  beforeEach(() => {
    requestClear();
    userToken = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    channelId = requestChannelsCreate(userToken, 'Xhorhas', true).body.channelId;
  });

  test('Test channel details', () => {
    const detailsObj = requestChannelDetails(userToken, channelId).body;
    expect(detailsObj).toEqual({
      name: 'Xhorhas',
      isPublic: true,
      ownerMembers: [{
        uId: expect.any(Number),
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'JingisuKan'
      }],
      allMembers: []
    });
  });

  test('Test Invalid parameters channel details', () => {
    const details = requestChannelDetails(userToken, -100);
    // expect(details.statusCode).toStrictEqual(INPUT_ERROR);
    expect(details.body).toEqual({ error: 'error' });
    requestLogout(userToken);
    const details2 = requestChannelDetails(userToken, channelId);
    // expect(details2.statusCode).toStrictEqual(INPUT_ERROR);
    expect(details2.body).toEqual({ error: 'error' });
  });
});
