import { channelsListV1, channelDetailsV1, channelsCreateV1 } from './channels';
import { authRegisterV1 } from "./auth";
import { clearV1 } from "./other";


//parameter { authuserid }

describe('Testing channelslist', () => {

  test('return all channles involved for userid' , () => {
      clearV1();
        
  const user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve',
   'Berrospi')
  const user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary',
   'Ang').authUserId;
  const user_id3 = authRegisterV1('z1319832@unsw.edu.au', 'aero456', 'Kenneth',
   'Kuo').authUserId;
  const user_id4 = authRegisterV1('z4234824@unsw.edu.au', 'aero654', 'David',
   'Pei').authUserId;
     
   const channel_air = channelsCreateV1( 'user_id1', 'Steve', 'Public');
   const channel_earth = channelsCreateV1( 'user_id2', 'Gary', 'Public');
   const channel_fire = channelsCreateV1( 'user_id3', 'Kenneth', 'Public');
   const channel_water = channelsCreateV1( 'user_id4', 'David', 'Public');
   
   channelJoinsV1( 'user_id1', 'channel_earth');
   channelJoinsV1( 'user_id1', 'channel_fire');
   channelJoinsV1( 'user_id1', 'channel_water');
   
   const lists = channelsListV1( 'user_id1' );
   
   expect(['channel_air', 'channel_earth', 'channel_fire', 'channel_water']).toEqual(expect.arrayContaining(lists));

        
        
    });
});
