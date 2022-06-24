import {authRegisterV1} from './auth';
import {channelsCreateV1, channelsListallV1} from './channels';
import {channelDetailsV1} from './channel';
import {clearV1} from './other';



describe('Test suite for channelJoinsV1', () => {
  let user_id1;
  let user_id2;
  let channel_id1;
  
  test('Channelid not existing', () => {
    clearV1();
   
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    channel_id1 = channelsCreateV1('user_id1', 'Steve', 'Public').channelId;
    
    expect(channelJoinV1('user_id2')).toStrictEqual({error: 'error'});
  });
  
  test('Already an existing member of channel', () => {
    clearV1();
    
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    channel_id1 = channelsCreateV1('user_id1', 'Steve', 'Public').channelId;
    
    expect(channelJoinV1('user_id2')).toStrictEqual({error: 'error'});
    
  });
  
  test('Channel is private', () => {
    clearV1();
    
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    channel_id1 = channelsCreateV1('user_id1', 'Steve', 'Public').channelId;
    
    expect(channelJoinV1('user_id2')).toStrictEqual({error: 'error'});
  });
  
  test('Joined succesfully', () => {
    clearV1();
    
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    channel_id1 = channelsCreateV1('user_id1', 'Steve', 'Public').channelId;
    
    expect(channelJoinV1('user_id2')).toStrictEqual({});
  });

});
