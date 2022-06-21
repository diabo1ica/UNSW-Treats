import validator from 'validator';
//validator.isEmail('foo@bar.com');

function authRegisterV1(email, password, nameFirst, nameLast) {
  if(//!validator.isEmail(email) 
   password.length < 6
  || !validName(nameFirst)
  || !validName(nameLast)){
    return {error : 'error'};
  }
  const data = getData();
  if(data.users.some(obj => obj.email === email)) return {error : 'error'};
  
  if(data.userIdCounter === 0){
    const user = userTemplate();
    user.id = 1;
    userIdCounter++;
  }
  else{
    const user = userTemplate();
    user.id = userIdCounter + 1;
    userIdCounter++;
  }
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
