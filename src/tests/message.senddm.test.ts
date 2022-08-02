import { requestClear, requestRegister, requestLogin, requestDmCreate, requestSendDm, generateMessage, INPUT_ERROR, AUTHORISATION_ERROR, OK } from './request';
let userId2: number, userId3: number, userId4: number;
let dmId1: number, dmId2: number, dmId3: number, dmId4: number;
let token1: string, token2: string, token3: string;
describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').body.token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').body.token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).body.dmId;
    dmId3 = requestDmCreate(token1, [userId3, userId4]).body.dmId;
    dmId4 = requestDmCreate(token1, [userId2, userId4]).body.dmId;
  });

  test('dmId is invalid', () => {
    expect(requestSendDm(token1, -dmId2, 'HELLO').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Message is empty (less than 1 character)', () => {
    expect(requestSendDm(token3, dmId1, '').statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Message is over 1000 characters', () => {
    const message = generateMessage(1200);
    expect(requestSendDm(token2, dmId3, message).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('dmId is valid but authorised user is not a member', () => {
    expect(requestSendDm(token3, dmId4, 'HIIII').statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid token', () => {
    expect(requestSendDm('-' + token3, dmId1, 'HLELO').statusCode).toStrictEqual(AUTHORISATION_ERROR);
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
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).body.dmId;
    dmId3 = requestDmCreate(token1, [userId3, userId4]).body.dmId;
    dmId4 = requestDmCreate(token1, [userId2, userId4]).body.dmId;
  });

  test('Correct output', () => {
    const res = requestSendDm(token1, dmId3, 'yooooooooooooooooo');
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining(
      {
        messageId: expect.any(Number)
      }
    ));
  });
});
