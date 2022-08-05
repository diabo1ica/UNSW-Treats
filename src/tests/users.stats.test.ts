import { AUTHORISATION_ERROR, requestClear, requestRegister, requestUsersStats } from './request';
let user1: any;

describe('Error Cases', () => {
  beforeEach(() => {
    requestClear();
    user1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').body; // has global perms
  });
  test('Invalid token', () => {
    expect(requestUsersStats('-' + user1.token).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
