import { requestClear, requestRegister, requestLogin, requestDmCreate, OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';
let userId2: number, userId3: number, userId4: number;
let token1: string;

describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
  });
  test('Invalid token', () => {
    const uIds = [userId2, userId3, userId4];
    expect(requestDmCreate('-' + token1, uIds).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('uIds contains an invalid uId', () => {
    const uIds = [userId2, -userId3, userId4];
    expect(requestDmCreate(token1, uIds).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Duplicate \'uIds\' in uIds', () => {
    const uIds = [userId2, userId2, userId4];
    expect(requestDmCreate(token1, uIds).statusCode).toStrictEqual(INPUT_ERROR);
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
  });

  test('Correct output', () => {
    const uIds = [userId2, userId3, userId4];
    const res = requestDmCreate(token1, uIds);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual({ dmId: expect.any(Number) });
  });
});
