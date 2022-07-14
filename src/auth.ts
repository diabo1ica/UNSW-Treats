import validator from 'validator';
import { getData, setData, user, dataStr } from './dataStore';

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
  const data: dataStr = getData();
  if (data.users.some(obj => obj.email === email)) return { error: 'error' };

  const numTemp = generateUserId();
  const user: user = userTemplate();
  if (data.users.length === 0) {
    user.userId = numTemp;
    user.globalPermsId = 1;
  } else {
    user.userId = numTemp;
  }
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  user.password = password;

  // Generate handle
  let handle: string = nameFirst + nameLast;
  handle = handle.replace(/[^A-Za-z0-9]/gi, '');
  if (handle.length > 20) handle = handle.slice(0, 20);
  if (data.users.some(obj => obj.handleStr === handle)) {
    for (let i = 0; i <= 9; i++) {
      const numStr: string = i.toString();
      if (!data.users.some(obj => obj.handleStr === (handle + numStr))) {
        handle = handle + numStr;
        break;
      }
    }
  }
  user.handleStr = handle;
  data.users.push(user);
  setData(data);
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
    Returns {error: 'error'} on email is invalid
    Returns {error: 'error'} on password is incorrect
*/
function authLoginV1(email: string, password: string) {
  if (validator.isEmail(email) === false) {
    throw new Error('email is invalid');
  }
  const data: dataStr = getData();
  for (const item of data.users) {
    if (email === item.email && password === item.password) {
      return {
        authUserId: item.userId,
      };
    }
  }
  throw new Error('email or password is incorrect');
}

function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

// Generates a valid userId
function generateUserId() {
  let id = Math.floor(Math.random() * 1000000);
  const data = getData();
  while (data.users.some((user) => user.userId === id)) {
    id = Math.floor(Math.random() * 1000000);
  }
  return id;
}


// Creates an empty user template
function userTemplate() {
  const user: user = {
    nameFirst: '',
    nameLast: '',
    handleStr: '',
    email: '',
    password: '',
    userId: 0,
    globalPermsId: 2,
  };
  return user;
}

export { authLoginV1, authRegisterV1 };
