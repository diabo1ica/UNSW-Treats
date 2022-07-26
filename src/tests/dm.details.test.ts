import { requestClear, requestRegister, requestLogin, requestDmCreate, requestDmDetails } from './request';
let userId1: number, userId2: number, userId4: number;
let dmId1: number;
let token1: string, token2: string, token3: string;

describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    userId1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.authUserId;
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4]).body.dmId;
  });

  test('Invalid token', () => {
    expect(requestDmDetails('-' + token1, dmId1).body).toStrictEqual({ error: 'error' });
  });

  test('Invalid dmId', () => {
    expect(requestDmDetails(token1, dmId1 + 1).body).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but authorised user is not a member', () => {
    expect(requestDmDetails(token3, dmId1).body).toStrictEqual({ error: 'error' });
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    userId1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.authUserId;
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4]).body.dmId;
  });

  test('Correct output', () => {
    expect(requestDmDetails(token2, dmId1).body).toStrictEqual(expect.objectContaining(
      {
        name: 'DavidPei, GaryAng, SteveBerrospi',
        members: expect.arrayContaining([expect.objectContaining(
          {
            uId: userId1,
            email: 'z5363495@unsw.edu.au',
            nameFirst: 'Steve',
            nameLast: 'Berrospi',
            handleStr: 'SteveBerrospi'
          }), expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'GaryAng'
          }), expect.objectContaining(
          {
            uId: userId4,
            email: 'z4234824@unsw.edu.au',
            nameFirst: 'David',
            nameLast: 'Pei',
            handleStr: 'DavidPei'
          }
        )
        ])
      }
    ));
  });
});
