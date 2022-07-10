import { userProfileV1 } from './users';
import { clearV1 } from './other';
import { authRegisterV1 } from './auth';

describe('Test for userProfileV1', () => {
  let userId1: number, userId2: number;

  beforeEach(() => {
    clearV1();
    userId1 = authRegisterV1('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    userId2 = authRegisterV1('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
  });

  test('uId does not exist', () => {
    expect(userProfileV1(userId1, -999)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const expected = {
      user: {
        uId: 2,
        email: 'z3329234@unsw.edu.au',
        nameFirst: 'Gary',
        nameLast: 'Ang',
        handleStr: 'GaryAng',
      }
    };
    expect(userProfileV1(userId1, userId2)).toEqual(expected);
  });
});
