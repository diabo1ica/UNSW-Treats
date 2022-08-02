import { requestClear, requestRegister, requestLogin, requestDmCreate, requestDmMessages, sendMessages } from './request';
import { OK, AUTHORISATION_ERROR, INPUT_ERROR } from './request';
let userId2: number, userId3: number, userId4: number;
let dmId1: number;
let token1: string, token2: string, token3: string, token4:string;

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
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
  });

  test('Invalid token', () => {
    expect(requestDmMessages('-' + token1, dmId1, 0).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid dmId', () => {
    expect(requestDmMessages(token1, -dmId1, 0).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('start is greater than total messages', () => {
    sendMessages(token2, dmId1, 30, 10);
    expect(requestDmMessages(token1, dmId1, 31).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('dmId is valid but authorised user is not a member', () => {
    const dmId2 = requestDmCreate(token1, [userId2, userId4]).body.dmId;
    sendMessages(token1, dmId2, 60, 5);
    expect(requestDmMessages(token3, dmId2, 0).statusCode).toStrictEqual(AUTHORISATION_ERROR);
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
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').body.token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).body.dmId;
  });

  test('Correct Output (start = 0)(59 messages sent)', () => {
    sendMessages(token1, dmId1, 15, 5);
    sendMessages(token2, dmId1, 15, 10);
    sendMessages(token3, dmId1, 10, 5);
    sendMessages(token4, dmId1, 19, 8);
    const res = requestDmMessages(token2, dmId1, 0);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([expect.objectContaining(
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: expect.any(String),
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false,
          }
        )]),
        start: 0,
        end: 50,
      }
    ));
    for (let i = 0; i < res.body.messages.length - 2; i++) {
      expect(res.body.messages[i].timeSent).toBeGreaterThanOrEqual(res.body.messages[i].timeSent);
    }
  });

  test('Correct Output (start = 45)(59 messages sent)', () => {
    sendMessages(token1, dmId1, 15, 5);
    sendMessages(token2, dmId1, 15, 10);
    sendMessages(token3, dmId1, 10, 5);
    sendMessages(token4, dmId1, 19, 8);
    const res = requestDmMessages(token2, dmId1, 45);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([expect.objectContaining(
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: expect.any(String),
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          }
        )]),
        start: 45,
        end: -1
      }
    ));
    for (let i = 0; i < res.body.messages.length - 2; i++) {
      expect(res.body.messages[i].timeSent).toBeGreaterThanOrEqual(res.body.messages[i].timeSent);
    }
  });

  test('Correct Output (start = 50)(50 messages sent)', () => {
    sendMessages(token1, dmId1, 50, 2);
    const res = requestDmMessages(token3, dmId1, 50);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual(expect.objectContaining({
      messages: [],
      start: 50,
      end: -1
    }));
  });
});
