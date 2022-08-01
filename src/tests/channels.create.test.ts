import { requestRegister, requestLogin, requestChannelsCreate, requestClear } from './request';
import { OK, INPUT_ERROR } from './request';

test('Testing ChannelsCreate (error)', () => {
  requestClear();
  requestRegister('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = requestLogin('justinbieber@gmail.com', '1122334455');
  const authUserId = a.body.authUserId;
  expect(requestChannelsCreate(authUserId, '', true).statusCode).toStrictEqual({INPUT_ERROR});
});

test('Testing ChannelsCreate (error)', () => {
  requestClear();
  requestRegister('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = requestLogin('justinbieber@gmail.com', '1122334455');
  const authUserId = a.body.authUserId;
  expect(requestChannelsCreate(authUserId, 'IamcurrrentlystudyingcomputerscienceinUNSW', true).statusCode).toStrictEqual({INPUT_ERROR});
});

test('Testing ChannelsCreate (no error)', () => {
  requestClear();
  requestRegister('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = requestLogin('justinbieber@gmail.com', '1122334455');
  const authUserId = a.body.authUserId;
  const b = requestChannelsCreate(authUserId, 'Channel1', true);
  expect(b.statusCode).toStrictEqual(OK);
  expect(b.body).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});

test('Testing ChannelsCreate (no error)', () => {
  requestClear();
  requestRegister('justinbieber@gmail.com', '1122334455', 'Justin', 'Bieber');
  const a = requestLogin('justinbieber@gmail.com', '1122334455');
  const authUserId = a.body.authUserId;
  const b = requestChannelsCreate(authUserId, 'Channel2', false);
  expect(b.statusCode).toStrictEqual(OK);
  expect(b.body).toStrictEqual(expect.objectContaining({
    channelId: expect.any(Number),
  }));
});
