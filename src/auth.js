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
    user.id = 1;
    data.userIdCounter++;
  }
  else{
    user.id = data.userIdCounter + 1;
    data.userIdCounter++;
  }
  user.email = email;
  user.name = nameFirst + ' ' + nameLast;
  user.password = password;
  data.users.push(user);
  return {
    authUserId: user.id
  }
}

function authloginV1(email, password) {
  return {
    authUserId: 1,
  }
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

export { authloginV1, authRegisterV1 };
