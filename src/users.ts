import HTTPError from 'http-errors';
import { INPUT_ERROR } from './tests/request';
import { getData, DataStr, setData } from './dataStore';
import validator from 'validator';

/*
Provide userId, email, first name, last name and handle for a valid user.

Arguments:
    authUserId (integer) - UserId for person that access uId userprofile
    uId (integer)        - The Id of person whose profile is being accessed

Return Value:
    Return { user } on valid authUserId and uId
    return {error: 'error'} on invalud uId
*/

export function userProfileV1(authUserId: number, uId: number) {
  const data: DataStr = getData();

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

function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

export function userSetNameV1(authUserId: number, nameFirst: string, nameLast: string) {
  const data: DataStr = getData();
  if (!validName(nameFirst) || !validName(nameLast)) {
    return { error: 'error' };
  }

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.nameFirst = nameFirst;
      item.nameLast = nameLast;
    }
  }
  setData(data);
  return {};
}

export function userSetemailV1(authUserId: number, email: string) {
  const data: DataStr = getData();
  if (!validator.isEmail(email)) {
    return { error: 'error' };
  }

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.email = email;
    }
  }
  setData(data);
  return {};
}

/*
Sets a new displayed name for user.

Arguments:
    authUserId (integer) - UserId for person that access uId userprofile
    handleStr (string)        - new handleStr to be displayed

Return Value:
    Return {} on valid authUserId
    return {error: 'error'} on invalud uId
*/
export function userProfileSethandleV1(authUserId:number, handleStr: string) {
  const data: DataStr = getData();
  // check for incorrect message length
  if (handleStr.length > 20 || handleStr.length < 3) {
    throw HTTPError(INPUT_ERROR, 'length is invalid');
  }
  // check if handStr is occupied
  for (const item of data.users) {
    console.log(handleStr, item.handleStr);
    if (item.handleStr === handleStr) {
      throw HTTPError(INPUT_ERROR, 'handleStr is occupied');
    }
  }
  // check for alphanumberic
  if (!isAlphaNumeric(handleStr)) {
    throw HTTPError(INPUT_ERROR, 'handleStr is not alphanumeric');
  }

  for (const user of data.users) {
    if (user.userId === authUserId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
}

/*
Provide a list of userId, email, first name, last name and handle for all valid users.

Arguments:
    authUserId (integer) - UserId for person that access list of users

Return Value:
    Return { users } on valid authUserId
    return {error: 'error'} on invalid authuserId
*/
export function usersAllV1(authUserId: number) {
  const data: DataStr = getData();
  const allUsers: any[] = [];

  for (const item of data.users) {
    allUsers.push({
      userId: item.userId,
      email: item.email,
      nameFirst: item.nameFirst,
      nameLast: item.nameLast,
      handleStr: item.handleStr,
    });
  }

  return { users: allUsers };
}

const isAlphaNumeric = (str: string) => /^[A-Za-z0-9]+$/gi.test(str);
