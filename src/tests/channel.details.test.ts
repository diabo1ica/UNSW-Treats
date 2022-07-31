import { requestClear, requestRegister, requestLogout, requestChannelsCreate, requestChannelDetails } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('channel details tests', () => {
  let userToken: string;
  let channelId: number;
  beforeEach(() => {
    requestClear();
    userToken = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    channelId = requestChannelsCreate(userToken, 'Xhorhas', true).body.channelId;
  });

  test('Test channel details', () => {
    const detailsObj = requestChannelDetails(userToken, channelId);
    expect(detailsObj.statusCode).toStrictEqual(OK);
    expect(detailsObj.body).toEqual({
      name: 'Xhorhas',
      isPublic: true,
      ownerMembers: [{
        uId: expect.any(Number),
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'jingisukan'
      }],
      allMembers: []
    });
  });

  test('Test Invalid parameters channel details', () => {
    // Invalid channel id
    const details = requestChannelDetails(userToken, -100);
    expect(details.statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid token
    requestLogout(userToken);
    const details2 = requestChannelDetails(userToken, channelId);
    expect(details2.statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid uid
    const token2 = requestRegister('Alalaly@gmail.com', 'Sk8teroiyob', 'sk8sk8', 'hiyahiya').body.token;
    const details3 = requestChannelDetails(token2, channelId);
    expect(details3.statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
