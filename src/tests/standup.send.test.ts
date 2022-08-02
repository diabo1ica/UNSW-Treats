import { AUTHORISATION_ERROR, INPUT_ERROR, OK, requestChannelsCreate, requestClear, requestRegister, requestStartStandUp, requestSendStandUp, requestJoinChannel, requestChannelMessages, generateMessage } from './request';
import { sleepFor } from './sleep';

let channelId: number, channelId2: number;
let token1: string, token2: string;
const length = 10;
describe('Test standup send', () => {
  beforeEach(() => {
    requestClear();
    token1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Crusader', 'Main').body.token;
    token2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'DNF', 'Coomer').body.token;
    channelId = requestChannelsCreate(token1, 'AERO', true).body.channelId;
    channelId2 = requestChannelsCreate(token1, 'AEGYO', true).body.channelId;
    requestJoinChannel(token2, channelId);
    requestStartStandUp(token1, channelId, length);
  });

  test('Standup send is valid', () => {
    const text1 = 'By the lord and the holy light pray that you may survive this mix.';
    const text2 = 'The great can corner carry but only the chosen ones can carry corner.';
    const text3 = "These quotes are sponsored by DNF Duel by ArcSys, long live daisuke's vision.";
    const res = requestSendStandUp(token1, channelId, text1);
    requestSendStandUp(token2, channelId, text2);
    requestSendStandUp(token1, channelId, text3);
    const StUpmessage = 'crusadermain: ' + text1 + '\n' + 'dnfcoomer: ' + text2 + '\n' + 'crusadermain: ' + text3;
    expect(res.statusCode).toStrictEqual(OK);
    const res2 = requestChannelMessages(token1, channelId, 0);
    expect(res2.body).toStrictEqual({
      messages: [{
        messageId: expect.any(Number),
        uId: expect.any(Number),
        message: StUpmessage,
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
  });

  test('Standup send invalid parameters', () => {
    const text1 = 'By the lord and the holy light pray that you may survive this mix.';
    const susToken = requestRegister('suskemogus@unsw.edu.au', 'iswerahevented', 'AMOGUS', 'Coomer').body.token;
    // Invalid token
    const res = requestSendStandUp('token1', channelId, text1);
    expect(res.statusCode).toStrictEqual(AUTHORISATION_ERROR);
    // Invalid channel Id
    const res2 = requestSendStandUp(token1, -100, text1);
    expect(res2.statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid message
    const res3 = requestSendStandUp(token1, channelId, generateMessage(1001));
    expect(res3.statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid user permission
    const res4 = requestSendStandUp(susToken, channelId, text1);
    expect(res4.statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });

  test('Standup send over or invalid', () => {
    const text1 = 'By the lord and the holy light pray that you may survive this mix.';
    // Standup inactive
    const res = requestSendStandUp(token1, channelId2, text1);
    expect(res.statusCode).toStrictEqual(INPUT_ERROR);
    sleepFor((length + 1) * 1000);
    // Standup over
    const res2 = requestSendStandUp(token1, channelId, text1);
    expect(res2.statusCode).toStrictEqual(INPUT_ERROR);
  });
});
