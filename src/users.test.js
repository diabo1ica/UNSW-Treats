import {userProfileV1} from './users';
import {clearV1} from './other';
import {authLoginV1, authRegisterV1} from './auth';



describe('Test for userProfileV1', () => {
  beforeEach( () => {
    clearV1();
    const user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    const user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
  });

  test('uId does not exist', () => { 
    expect(userProfileV1('user_id1', '999')).toStrictEqual({error: 'error'});
  });

  test('correct return', () => {
    const user = {
      uId: 1,
      email: 'z3329234@unsw.edu.au',
      nameFirst: 'Gary',
      nameLast: 'Ang',
      handleStr: 'garyang',
    };
    
    expect(userProfileV1('user_id1', 'user_id2')).toMatchObject(user);
  });
});
