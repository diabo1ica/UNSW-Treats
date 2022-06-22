import validator from 'validator';
import { getData, setData } from './dataStore.js';

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
    user.globalPermsId = 1;
  }
  else{
    user.userId = data.userIdCounter + 1;
    data.userIdCounter++;
  }
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  user.password = password;
  data.users.push(user);
  return {
    authUserId: user.userId
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
    nameFirst: '',
    nameLast:'',
    email: '',
    password: '',
    userId: 0,
    globalPermsId: 2
  }
  return user;
}

export { authloginV1, authRegisterV1 };
