import { requestRegister, requestLogin, requestClear, requestUserProfile } from './request';
import { INPUT_ERROR } from './request';

describe('users path tests', () => {
  let token : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    userID = obj.body.authUserId;
  });

  test('UserProfile Successfull', () => {
    expect(requestUserProfile(token, userID).body).toStrictEqual({
      user: {
        uId: userID,
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'jingisukan',
      }
    });
  });

  test('UserProfile Unsuccessfull', () => {
    expect(requestUserProfile(token, -321).statusCode).toStrictEqual(INPUT_ERROR);
  });
});
