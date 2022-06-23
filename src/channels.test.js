import {channelsListV1, channelDetailsV1, channelsCreateV1} from './channels';
import {authRegisterV1} from './auth';
import {channelJoinV1} from './channel';
import {clearV1} from './other';

describe('Testing channelslist', () => {

  test('return all channles involved for userid' , () => {
    clearV1();
        
  const user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve',
   'Berrospi').authUserId;
  const user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary',
   'Ang').authUserId;

   const channel_air = channelsCreateV1( 'user_id1', 'air', 'Public').channelId;
   const channel_earth = channelsCreateV1( 'user_id2', 'earth', 'Public').channelId;

   channelJoinV1( 'user_id1', 'channel_earth');
   
   //const lists = channelsListV1( 'user_id1' );
   
   expect(channelsListV1( 'user_id1' )).toStrictEqual(expect.objectContaining(
   {
   channels: expect.arrayContaining([
   {channelId: channel_air, name: 'air',}, 
   {channelId: channel_earth, name: 'earth',}
   ])
   }));

        
        
    });
});
