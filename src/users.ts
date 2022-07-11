import { getData, dataStr } from './dataStore';

/*
Provide userId, email, first name, last name and handle for a valid user.

Arguments:
    authUserId (integer) - UserId for person that access uId userprofile
    uId (integer)        - The Id of person whose profile is being accessed

Return Value:
    Return { user } on valid authUserId and uId
    return {error: 'error'} on invalud uId
*/

function userProfileV1(authUserId: number, uId: number) {
  const data: dataStr = getData();

  for (const item of data.users) {
    if (item.userId === uId) {
      return {
        user: {
          uId: item.userId,
          email: item.email,
          nameFirst: item.nameFirst,
          nameLast: item.nameLast,
          handleStr: item.handleStr,
        }
      };
    }
  }

  return { error: 'error' };
}

export { userProfileV1 };
