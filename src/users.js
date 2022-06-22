import {getData} from './dataStore';

function userProfileV1(authUserId, uId) {
  let data = getData();
  
  for (let uId of data.users.userId) {
    if (uId === data.users.userId) {
      return data.users;
    }
  }
  
  return {error : 'error'};
}

export { userProfileV1 }
