import { authRegisterV1, authLoginV1 } from './auth.js';
import { clearV1 } from './other.js';
import { channelJoinV1} from './channel.js';
import { channelsCreateV1} from './channels.js';

describe('Test suite for channelJoinsV1', () => {
    let user_id1;
    let user_id2;
  beforeEach(() => {
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
  });
  
  afterEach(() => {
    clearV1();
  });

  test('ChannelId not existing', () => {
    expect(channelJoinV1(user_id2, -1)).toStrictEqual({error: 'error'});
  });
  
  test('Already an existing member of channel', () => {
    const channel_id1 = channelsCreateV1(user_id1, 'Steve', true).channelId;
    expect(channelJoinV1(user_id1, channel_id1)).toStrictEqual({error: 'error'});
    
  });
  
  test('Channel is private', () => {
    const channel_id1 = channelsCreateV1(user_id1, 'Steve', false).channelId;
    expect(channelJoinV1(user_id2, channel_id1)).toStrictEqual({error: 'error'});
  });
  
  test('Joined succesfully', () => {
    const channel_id1 = channelsCreateV1(user_id1, 'Steve', true).channelId;
    expect(channelJoinV1(user_id2, channel_id1)).toStrictEqual({});
  });

});
