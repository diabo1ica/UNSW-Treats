import { channelsCreateV1 } from './channels.js';
import { channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

describe('channelDetails tests', () => {
  beforeEach(() => {
    authRegisterV1('email@gmail.com', 'drowssap', 'Drow', 'Sapling');
    channelsCreateV1(1, 'Ghor Dranas', true);
  });

  afterEach(() => {
    clearV1();
  });  
  
  test('Valid Channel Details',() => {
    expect(channelDetailsV1(1, 1)).toStrictEqual({
      channelId: 1,
      name: 'Ghor Dranas', 
      isPublic: true,
      members: [{
        uId: 1,
        email: 'email@gmail.com',
        nameFirst: 'Drow',
        nameLast: 'Sapling',
        handleStr: '',
        channelPermsId: 1,
      }]
    });
  });

  test('Invalid authId and channelId',() => {
    expect(channelDetailsV1(2, 2)).toStrictEqual({error: 'error'});
  });

  test('Invalid channelId',() => {
    expect(channelDetailsV1(1, 2)).toStrictEqual({error: 'error'});
  });

  test('Valid channelId but invalid authId',() => {
    expect(channelDetailsV1(2, 1)).toStrictEqual({error: 'error'});
  });

});
