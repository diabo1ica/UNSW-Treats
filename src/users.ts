import { getData, dataStr, setData } from './dataStore';
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

function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

export function userSetNameV1(authUserId: number, nameFirst: string, nameLast: string) {
  const data: dataStr = getData();
  if (!validName(nameFirst) || !validName(nameLast)) {
    return {error: 'error'};
  }
 
  for (let item of data.users) {
    if (item.userId === authUserId) {
      item.nameFirst = nameFirst;
      item.nameLast = nameLast;
    }
  }
  setData(data);
  return {};
}

export function userSetemailV1(authUserId: number, email: string) {
  const data: dataStr = getData();
  if (!validator.isEmail(email)) {
    return {error: 'error'};
  }
  
  for (let item of data.users) {
    if (item.userId === authUserId) {
      item.email = email;
    }
  }
  setData(data);
  return {};
}

