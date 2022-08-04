import { getData, DataStr, setData } from './dataStore';
import validator from 'validator';
import { getCurrentTime, isDmMember, isMember, atLeastOne } from './util';

/*
Provide userId, email, first name, last name and handle for a valid user.

Arguments:
    authUserId (integer) - UserId for person that access uId userprofile
    uId (integer)        - The Id of person whose profile is being accessed

Return Value:
    Return { user } on valid authUserId and uId
    return {error: 'error'} on invalid uId
*/

export function userProfileV1(uId: number) {
  const data: DataStr = getData();

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

  return { error400: 'Invalid Uid' };
}

function validName(name: string) {
  if (name.length < 1 || name.length > 50) return false;
  return true;
}

export function userSetNameV1(authUserId: number, nameFirst: string, nameLast: string) {
  const data: DataStr = getData();
  if (!validName(nameFirst) || !validName(nameLast)) {
    return { error400: 'Invalid first name or last name' };
  }

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.nameFirst = nameFirst;
      item.nameLast = nameLast;
    }
  }
  setData(data);
  return {};
}

export function userSetemailV1(authUserId: number, email: string) {
  const data: DataStr = getData();
  if (!validator.isEmail(email)) {
    return { error400: 'Invalid email' };
  }

  for (const item of data.users) {
    if (item.userId === authUserId) {
      item.email = email;
    }
  }
  setData(data);
  return {};
}

// set a new displayed name for user
function userProfileSethandleV1(authUserId:number, handleStr: string) {
  const data: DataStr = getData();
  console.log(handleStr as string);
  // check for incorrect message length
  if (handleStr.length > 20 || handleStr.length < 3) {
    return { error: 'error' };
  }
  // check if handStr is occupied
  for (const item of data.users) {
    console.log(handleStr, item.handleStr);
    if (item.handleStr === handleStr) {
      return { error: 'error' };
    }
  }
  // check for alphanumberic
  if (!isAlphaNumeric(handleStr)) {
    return { error: 'error' };
  }

  for (const user of data.users) {
    if (user.userId === authUserId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }

  return { error: 'error' };
}

// return array of all user and assocaited detail
function usersAllV1(authUserId: number) {
  const data: DataStr = getData();
  const allUsers: any[] = [];

  for (const item of data.users) {
    allUsers.push({
      userId: item.userId,
      email: item.email,
      nameFirst: item.nameFirst,
      nameLast: item.nameLast,
      handleStr: item.handleStr,
    });
  }

  return { users: allUsers };
}

export function userStatsv1 (authUserId: number) {
  const data: DataStr = getData();
  const channelsJoined: any[] = [];
  const dmsJoined: any[] = [];
  const messageSent: any[] = [];

  let numChannel: number = 0;
  for (const channel of data.channels) {
    numChannel++;
  }

  let numDms: number = 0;
  for (const dms of data.dms) {
    numDms++;
  }

  let numMsg: number = 0;
  for (const msg of data.messages) {
    numMsg++;
  }

  let i = 0;
  for (const channel of data.channels) {
    if (isMember(authUserId, channel)) {
      channelsJoined.push({
        numChannelsJoined: i,
        timeStamp: 0,
      })
      i++;
    }
  }

  let j = 0;
  for (const dm of data.dms) {
    if (isDmMember(authUserId, dm)) {
      dmsJoined.push({
        numDmsJoined: j,
        timeStamp: 0,
      })
      j++;
    }
  }

  let k = 0;
  for (const msg of data.messages) {
    if (msg.uId === authUserId) {
      messageSent.push({
        numMessagesExist: k,
        timeStamp: 0,
      })
      k++;
    }
  }
  let involvement: number = 0;
  if ((numChannel + numDms + numMsg) !== 0) {
    involvement = Math.round((((i + j + k) / (numChannel + numDms + numMsg)) * 10) / 10);
    if (involvement > 1) {
      involvement = 1;
    }
  }

  return {
    channelsJoined: channelsJoined,
    dmsJoined: dmsJoined,
    messagesSent: messageSent,
    involvementRate: involvement,
  };
}

export function usersStatsv1 (authUserId: number) {
  const data: DataStr = getData();
  const channelsExist: any[] = [];
  const dmsExist: any[] = [];
  const messagesExist: any[] = [];

  let numChannel: number = 0;
  for (const channel of data.channels) {
    channelsExist.push({
      numChannelsExist: numChannel,
      timeStamp: 0,
    })
    numChannel++;
  }

  let numDms: number = 0;
  for (const dms of data.dms) {
    dmsExist.push({
      numDmsExist: numDms,
      timeStamp: 0,
    })
    numDms++;
  }

  let numMsg: number = 0;
  for (const msg of data.messages) {
    messagesExist.push({
      numMessagesExist: numMsg,
      timeStamp: 0,
    })
    numMsg++;
  }

  let utilization: number = 0;
  let numUserAtOne: number = 0;
  let numUser: number = 0;
  for (const user of data.users) {
    numUserAtOne = numUserAtOne + atLeastOne(user.userId); 
    numUser++;
  }  

  utilization = Math.round(((numUserAtOne / numUser) * 10) / 10);
  
  return {
    channelsExist: channelsExist,
    dmsExist: dmsExist,
    messagesExist: messagesExist,
    utilizationRate: utilization,
  };
}

const isAlphaNumeric = (str: string) => /^[A-Za-z0-9]+$/gi.test(str);

export { usersAllV1, userProfileSethandleV1 };
