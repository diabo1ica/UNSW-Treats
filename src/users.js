import {getData} from './dataStore';

function userProfileV1(authUserId, uId) {
  let data = getData();
  
  for (let item of data.users) {
    if (item.userId === uId) {
      return { 
        user: {
          uId: item.userId,
          email: item.email,
          nameFirst: item.nameFirst,
          nameLast: item.nameLast,
          handleStr: item.handleStr,
        }
      }
    }
  }
  
  return {error : 'error'};
}

export { userProfileV1 }
