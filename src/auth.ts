import validator from 'validator';
import { getData, setData, User, DataStr } from './dataStore';
import HTTPError from 'http-errors';
import { INPUT_ERROR } from './tests/request';
import * as jose from 'jose';
import { getCurrentTime, stampUserUpdate } from './util';

const encrypt = (password: string): string => new jose.UnsecuredJWT({ password: password }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
const decrypt = (password: string): string => jose.UnsecuredJWT.decode(password).payload.password as string;

// Creates a user and store it in dataStore
// Arguments:
//    email (string)      - An email string used to register the user
//    password (string)   - A string used for the user's password
//    nameFirst (string)  - The user's first name
//    nameLast (string)   - The user's last name
// Return value:
//    Returns authUserId on email, password, nameFirst and namelast is valid
//    Returns { error : 'error' } on email not valid (Already taken, argument not in email format
//    Returns { error : 'error' } on password length not valid (< 6)
//    Returns { error : 'error' } on nameFirst and/or nameLast length not valid

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string) {
  if (!validator.isEmail(email) ||
  password.length < 6 ||
  !validName(nameFirst) ||
  !validName(nameLast)) {
    return { error: 'error' };
  }
  const data: DataStr = getData();
  if (data.users.some(obj => obj.email === email)) return { error: 'error' };

  const user: User = userTemplate();
  if (data.users.length === 0) {
    user.globalPermsId = 1;
  }
  data.userIdCounter++;
  user.userId = data.userIdCounter;
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  user.password = encrypt(password);

  // Generate handle
  const handle: string = generateHandle(nameFirst, nameLast);
  user.handleStr = handle;
  data.users.push(user);
  setData(data);
  stampUserUpdate(user.userId, getCurrentTime());
  return {
    authUserId: user.userId
  };
}
/*
Allows the user to login to their account and view their userId.

Arguments:
    email (string)    - the email which the user has used to register their
                        account with.
    password (string)    - The password which the user has used to register
                           their account with.

Return Value:
    Returns authUserId on email is valid and password is correct
    Returns {error400} on email is invalid
    Returns {error400} on password is incorrect
*/
function authLoginV1(email: string, password: string) {
  const data: DataStr = getData();
  for (const item of data.users) {
    if (email === item.email && password === decrypt(item.password)) {
      return {
        authUserId: item.userId,
      };
    }
  }
  throw HTTPError(INPUT_ERROR, 'email and/or password is incorrect');
}

function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

// Creates an empty user template
function userTemplate() {
  const user: User = {
    nameFirst: '',
    nameLast: '',
    handleStr: '',
    email: '',
    password: '',
    userId: 0,
    globalPermsId: 2,
    notifications: []
  };
  return user;
}

function generateHandle(nameFirst: string, nameLast: string) {
  const data: DataStr = getData();
  let handle: string = nameFirst + nameLast;
  handle = handle.replace(/[^A-Za-z0-9]/gi, '');
  handle = handle.toLowerCase();
  if (handle.length > 20) handle = handle.slice(0, 20);
  if (data.users.some(obj => obj.handleStr === handle)) {
    for (let i = 0; i <= 9; i++) {
      const numStr: string = i.toString();
      if (!data.users.some(obj => obj.handleStr === (handle + numStr))) {
        return handle + numStr;
      }
    }
  }
  return handle;
}

export { authLoginV1, authRegisterV1 };
