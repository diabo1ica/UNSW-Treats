import { getData, dataStr, user, setData } from './dataStore';

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

function userProfileSethandleV1(authUserId:number, handleStr: string) {
  const data: dataStr = getData();

  if (handleStr.length > 20 || handleStr.length < 3) {
    return {error: 'error'};
  };

  for (const item of data.users) {
    if (item.handleStr === handleStr) {
      return {error: 'error'};
    };
  };

  if (!isAlphaNumeric(handleStr)) {
    return {error: 'error'};
  }
  
  for (const user of data.users) {
    if (user.userId === authUserId) {
      user.handleStr = handleStr;
    };
  };

  setData(data);
}

function usersAllV1(authUserId: number) {
  const data: dataStr = getData();
  let userarray: user[];

  for (const item of data.users) {
    userarray.push(item);
  }

  return ({users: userarray});
}

const isAlphaNumeric = str => /^[A-Za-z0-9]+$/gi.test(str);


export { userProfileV1, usersAllV1, userProfileSethandleV1 };
