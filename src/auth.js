import validator from 'validator';
import {getData} from './dataStore';

function authRegisterV1(email, password, nameFirst, nameLast) {
  if(!validator.isEmail(email) 
  || password.length < 6
  || !validName(nameFirst)
  || !validName(nameLast)){
    return {error : 'error'};
  }
  const data = getData();
  if(data.users.some(obj => obj.email === email)) return {error : 'error'};
  
  const user = userTemplate();
  if(data.userIdCounter === 0){
    user.userId = 1;
    data.userIdCounter++;
  }
  else{
    user.userId = data.userIdCounter + 1;
    data.userIdCounter++;
  }
  user.email = email;
  user.name = nameFirst + ' ' + nameLast;
  user.password = password;
  data.users.push(user);
  return {
    authUserId: user.userId
  }
}

function authLoginV1(email, password) {
  if (validator.isEmail(email) === false) {
    return {
      error: 'error',
    }
  }
  const data = getData();
  for (let item of data.users) {
    if (email === item.email) {
      if (password === item.password) {
        return {
          authUserId: item.userId,
        };
      }
    }
  }
  return {
    error: 'error'
  };
}

function validName(name){
  if(name.length < 1 || name.length > 50) return false;
  return true;
}

// TODO implement a user template function
function userTemplate(){
  const user = {
    name: '',
    email: '',
    password: '',
    userId: 0 
  }
  return user;
}

<<<<<<< HEAD
export { authloginV1, authRegisterV1 };
>>>>>>> origin/gary
=======
export { authLoginV1, authRegisterV1 };
>>>>>>> f3bbffbd389a15c4527c2ca9a213f2b49177c554
