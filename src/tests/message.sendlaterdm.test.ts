import { getCurrentTime } from '../util';
import { AUTHORISATION_ERROR, generateMessage, INPUT_ERROR, OK, requestClear, requestDmCreate, requestDmMessages, requestRegister, requestSendLaterDm, sendMessages } from './request';

let user1: any, user2: any, user3: any;
let dmId: number;
const time = 10;
describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    user1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body;
    user2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    user3 = requestRegister('z5363442@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body;
    dmId = requestDmCreate(user1.token, [user2.authUserId]).body.dmId;
  });

  test('Invalid Token', () => {
    expect(requestSendLaterDm('-' + user1.token, dmId, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid DM', () => {
    expect(requestSendLaterDm(user1.token, dmId - 1000, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Length of message is less than 1 character', () => {
    expect(requestSendLaterDm(user1.token, dmId, '', getCurrentTime() + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('Length of message is over 1000 characters', () => {
    expect(requestSendLaterDm(user1.token, dmId, generateMessage(1100), +getCurrentTime + time).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('timeSent is a time in the past', () => {
    expect(requestSendLaterDm(user2.token, dmId, generateMessage(4), getCurrentTime() - 1));
  });

  test('User is not a member of the DM they are trying to post to', () => {
    expect(requestSendLaterDm(user3.token, dmId, generateMessage(4), getCurrentTime() + time).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    user1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body;
    user2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    user3 = requestRegister('z5363442@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body;
    dmId = requestDmCreate(user1.token, [user2.authUserId]).body.dmId;
  });

  test('Send message 10 seconds later', () => {
    sendMessages(user2.token, dmId, 2, 3);
    const res = requestSendLaterDm(user1.token, dmId, generateMessage(4), getCurrentTime() + time);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual({
      messageId: expect.any(Number)
    });

    expect(requestDmMessages(user2.token, dmId, 0).body.messages).toStrictEqual([
      {
        messageId: expect.any(Number),
        uId: user2.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: expect.any(Number),
        uId: user2.authUserId,
        message: expect.any(String),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }
    ]);
  });
});
