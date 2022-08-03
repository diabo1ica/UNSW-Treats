import { requestClear, requestRegister, requestLogin, requestSetemail, requestSetname, requestUserProfile} from './request';


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
  
    test('SetName & SetEmail Successfull', () => {
      requestSetname(token, 'Kennt', 'Alex');
      requestSetemail(token, 'Iloveyou@gmail.com');
      expect(requestUserProfile(token, userID).body).toStrictEqual({
        user: {
          uId: userID,
          email: 'Iloveyou@gmail.com',
          nameFirst: 'Kennt',
          nameLast: 'Alex',
          handleStr: 'jingisukan',
        }
      });
    });
  });