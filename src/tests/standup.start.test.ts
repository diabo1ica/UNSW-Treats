import { getCurrentTime } from '../util';
import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelsCreate, requestClear, requestRegister, requestStartStandUp } from './request';

let channelId: number;
let token1: string, token2: string;
const length = 15;
const ERROR = 1;
describe('Error cases', () => {
  beforeEach(() => {
    requestClear();
    token1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.token;
    token2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.token;
    channelId = requestChannelsCreate(token1, 'AERO', true).body.channelId;
  });

  test('Invalid token', () => {
    expect(requestStartStandUp('-' + token1, channelId, length).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Invalid channel', () => {
    expect(requestStartStandUp(token1, channelId - 1000, length).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('length is a negative number', () => {
    expect(requestStartStandUp(token1, channelId, -2).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('User is not a member of the channel', () => {
    expect(requestStartStandUp(token2, channelId, 10).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('An active standup is currently running', () => {
    const res = requestStartStandUp(token1, channelId, length);
    expect(res.statusCode).toStrictEqual(OK);
    expect(requestStartStandUp(token1, channelId, length).statusCode).toStrictEqual(INPUT_ERROR);
  });
});

describe('Working cases', () => {
  beforeEach(() => {
    requestClear();
    token1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.token;
    token2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.token;
    channelId = requestChannelsCreate(token1, 'AERO', true).body.channelId;
  });

  test('Start standup', () => {
    const time = getCurrentTime();
    const res = requestStartStandUp(token1, channelId, length);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual({ timeFinish: expect.any(Number) });
    expect(res.body.timeFinish).toBeLessThanOrEqual(time + length + ERROR);
  });
});
