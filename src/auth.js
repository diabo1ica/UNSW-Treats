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
  
  // Generate handle
  let handle = nameFirst + nameLast;
  if(handle.length > 20) handle = handle.slice(0, 20);
  if(data.users.some(obj => obj.handleStr === handle)){
    for(const i = 0; i <= 9; i++){
      let numStr = i.toString();
      if(!data.users.some(obj => obj.handleStr === (handle + numStr))){
        handle = handle + numStr;
        break;
      }
    }
  }
  user.handleStr = handle;  
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
    nameFirst: '',
    nameLast:'',
    handleStr: '',
    email: '',
    password: '',
    userId: 0,
    globalPermsId: 2
  }
  return user;
}

export { authLoginV1, authRegisterV1 };
