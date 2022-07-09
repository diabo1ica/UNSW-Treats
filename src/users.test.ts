// @ts-nocheck
import {userProfileV1} from './users';
import {clearV1} from './other';
import {authLoginV1, authRegisterV1} from './auth';



describe('Test for userProfileV1', () => {
    let user_id1, user_id2;

  beforeEach( () => {
    clearV1();
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
  });

  test('uId does not exist', () => { 
    expect(userProfileV1(user_id1, -999)).toStrictEqual({error: 'error'});
  });

  test('correct return', () => {
    const expected = {
        user : {
            uId: 2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'GaryAng',
        }
    }   
    expect(userProfileV1(user_id1, user_id2)).toEqual(expected);

  });
});
