import { requestRegister, requestLogin, requestChannelsCreate, requestClear } from './request';
import { OK, INPUT_ERROR } from './request';

describe('channels path tests', () => {
  let userID : string;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    userID = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo').body.token;
  });
  test('ChannelsCreate Successfull', () => {
    expect(requestChannelsCreate(userID, 'Channel1', true).statusCode).toStrictEqual(OK);
    expect(requestChannelsCreate(userID, 'Channel1', true).body).toStrictEqual(expect.objectContaining({
      channelId: expect.any(Number),
    }));
  });

  test('ChannelsCreate Unsuccessfull', () => {
    expect(requestChannelsCreate(userID, 'Iloveyoubabyandwillmarryyouchannel', true).statusCode).toStrictEqual(INPUT_ERROR);
  });
});