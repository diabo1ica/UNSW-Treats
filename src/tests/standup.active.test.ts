import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelsCreate, requestClear, requestRegister, requestStartStandUp, requestStandUpActive } from './request';
import { sleepFor } from './sleep';

let channelId: number;
let token1: string, token2: string;
let timeFinish: number;
const length = 10;
describe('Test standup active', () => {
  beforeEach(() => {
    requestClear();
    token1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body.token;
    token2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body.token;
    channelId = requestChannelsCreate(token1, 'AERO', true).body.channelId;
    timeFinish = requestStartStandUp(token1, channelId, length).body.timeFinish;
  });

  test('Standup is active valid', () => {
    const res = requestStandUpActive(token1, channelId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual({
      isActive: true,
      timeFinish: timeFinish
    });
  });

  test('Standup is active invalid parameters', () => {
    // Invalid channel
    const res = requestStandUpActive(token1, -100);
    expect(res.statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid token
    const res2 = requestStandUpActive('a', channelId);
    expect(res2.statusCode).toStrictEqual(AUTHORISATION_ERROR);
    // Invalid user permission
    const res3 = requestStandUpActive(token2, channelId);
    expect(res3.statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Standup is inactive valid', () => {
    sleepFor(length * 1000);
    const res = requestStandUpActive(token1, channelId);
    expect(res.statusCode).toStrictEqual(OK);
    expect(res.body).toStrictEqual({
      isActive: false,
      timeFinish: timeFinish
    });
  });
});
