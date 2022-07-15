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

// Validates the given name is between 1 to 50 characters long inclusive
function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

/*
Sets the new first name and last name of the authorised user

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    nameFirst (string)    - First name the user wishes to switch to
    nameLast (string)    - Last name the user wishes to switch to

Return Value:
    Returns {} on Valid/active token & nameFirst and nameLast have 1-50 characters
    Returns {error: 'error'} on invalid/inactive token | length of nameFirst
    is not between 1 and 50 characters inclusive | length of nameLast is not
    between 1 and 50 characters inclusive
*/

export function userSetNameV1(authUserId: number, nameFirst: string, nameLast: string) {
  const data: dataStr = getData();
  if (!validName(nameFirst) || !validName(nameLast)) {
    return { error: 'error' };
  } // check all errors

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.nameFirst = nameFirst;
      item.nameLast = nameLast;
    }
  } // set the nameFirst and nameLast
  setData(data);
  return {};
}

/*
Sets the new email of the authorised user

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    email (string)    - email that user wishes to switch to

Return Value:
    Returns {} on Valid/active token & valid email & email is not being used
    Returns {error: 'error'} on invalid/inactive token | email entered
    is not a valid email | email address is being used by another user
*/

export function userSetemailV1(authUserId: number, email: string) {
  const data: dataStr = getData();
  if (!validator.isEmail(email)) {
    return { error: 'error' };
  } // Validate the new email

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.email = email;
    }
  } // set the new email
  setData(data);
  return {};
}
