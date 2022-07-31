import { requestClear, requestRegister, requestLogin, requestDmCreate, requestDmLeave, requestDmDetails } from './request';
let userId2: number, userId3: number, userId4: number;
let dmId1: number, dmId2: number;
let token1: string, token2: string, token4: string;

describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).body.dmId;
  });

  test('Invalid token', () => {
    expect(requestDmLeave('-123', dmId1).body).toStrictEqual({ error: 'error' });
  });

  test('dmId refers to invalid DM', () => {
    expect(requestDmLeave(token1, -dmId1).body).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but user is not a member of the DM', () => {
    expect(requestDmLeave(token4, dmId2).body).toStrictEqual({ error: 'error' });
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).body.dmId;
  });

  test('Correct Output', () => {
    expect(requestDmLeave(token2, dmId2).body).toStrictEqual({});
    expect(requestDmDetails(token1, dmId2).body).toStrictEqual(expect.objectContaining(
      {
        name: 'garyang, kennethkuo, steveberrospi',
        members: expect.not.arrayContaining([expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'garyang'
          }
        )])
      }
    ));
    expect(requestDmLeave(token2, dmId1).body).toStrictEqual({});
    expect(requestDmDetails(token1, dmId1).body).toStrictEqual(expect.objectContaining(
      {
        name: 'davidpei, garyang, kennethkuo, steveberrospi',
        members: expect.not.arrayContaining([expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'garyang'
          }
        )])
      }
    ));
  });
});
