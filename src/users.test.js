import {userProfileV1} from './users';
import (clearV1} from './others';
import {authLoginV1} from './auth';



descrive('Test for userProfileV1', () => {

  test('uId does not exist', () => {
    clearV1();
    
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    expect(userProfileV1('user_id1', 'user_id2')).toStrictEqual({error: 'error'});
    
  });

  test('correct return', () => {
    clearV1();
    const user = {
      uId: 1,
      email: 'z3329234@unsw.edu.au',
      nameFirst: 'Gary',
      nameLast: 'Ang',
      handleStr: 'garyang',
    };
    user_id1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    user_id2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    
    expect(userProfileV1('user_id1', 'user_id2')).toMatchObject(user);
    
  });
});
