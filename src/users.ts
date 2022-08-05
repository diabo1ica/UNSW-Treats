import HTTPError from 'http-errors';
import { INPUT_ERROR } from './tests/request';
import { getData, DataStr, setData } from './dataStore';
import validator from 'validator';
import { deepCopy, filterChannelsJoined, filterDmsJoined, filterMessagesSent, getUserChannelsJoined, getUserDmsJoined, getUserInvolvement, getUserMessagesSent, getUserUpdates, isDmMember, isMember, validateUserId } from './util';
import { channelLeave } from './channel';
import { dmLeave } from './dm';

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

/*
Sets a new displayed name for user.

Arguments:
    authUserId (integer) - UserId for person that access uId userprofile
    handleStr (string)        - new handleStr to be displayed

Return Value:
    Return {} on valid authUserId
    return {error: 'error'} on invalud uId
*/
export function userProfileSethandleV1(authUserId:number, handleStr: string) {
  const data: DataStr = getData();
  // check for incorrect message length
  if (handleStr.length > 20 || handleStr.length < 3) {
    throw HTTPError(INPUT_ERROR, 'length is invalid');
  }
  // check if handStr is occupied
  for (const item of data.users) {
    if (item.handleStr === handleStr) {
      throw HTTPError(INPUT_ERROR, 'handleStr is occupied');
    }
  }
  // check for alphanumberic
  if (!isAlphaNumeric(handleStr)) {
    throw HTTPError(INPUT_ERROR, 'handleStr is not alphanumeric');
  }

  for (const user of data.users) {
    if (user.userId === authUserId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
}

/*
Provide a list of userId, email, first name, last name and handle for all valid users.

Arguments:
    authUserId (integer) - UserId for person that access list of users

Return Value:
    Return { users } on valid authUserId
    return {error: 'error'} on invalid authuserId
*/
export function usersAllV1(authUserId: number) {
  const data: DataStr = getData();
  const allUsers: any[] = [];

  for (const item of data.users) {
    if (item.nameFirst !== 'Removed' && item.nameLast !== 'user') {
      allUsers.push({
        userId: item.userId,
        email: item.email,
        nameFirst: item.nameFirst,
        nameLast: item.nameLast,
        handleStr: item.handleStr,
      });
    }
  }

  return { users: allUsers };
}

export function userStats(authUserId: number) { 
  const messagesSent = deepCopy(getUserUpdates(authUserId));
  const dmsJoined = deepCopy(getUserUpdates(authUserId));
  const channelsJoined = deepCopy(getUserUpdates(authUserId));
  filterChannelsJoined(channelsJoined);
  filterDmsJoined(dmsJoined);
  filterMessagesSent(messagesSent);

  return {
    userStats: {
      channelsJoined: channelsJoined,
      dmsJoined: dmsJoined,
      messagesSent: messagesSent,
      involvementRate: getUserInvolvement(getUserChannelsJoined(authUserId), getUserDmsJoined(authUserId), getUserMessagesSent(authUserId))
    }
  }
}
/*
export function usersStatsv1 (authUserId: number) {
  const data: DataStr = getData();
  const channelsExist: any[] = [];
  const dmsExist: any[] = [];
  const messagesExist: any[] = [];

  let numChannel = data.channels.length;
  let numDms = data.dms.length;
  let numMsg = data.messages.length;

  for (const channel of data.channels) {
    channelsExist.push({
      numChannelsExist: numChannel,
      timeStamp: 0,
    });
    numChannel++;
  }

  for (const dms of data.dms) {
    dmsExist.push({
      numDmsExist: numDms,
      timeStamp: 0,
    });
    numDms++;
  }

  for (const msg of data.messages) {
    messagesExist.push({
      numMessagesExist: numMsg,
      timeStamp: 0,
    });
    numMsg++;
  }

  let utilization = 0;
  let numUserAtOne = 0;
  let numUser = 0;
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
*/

export function adminRemove (authUserId: number, uId : number) {
  const data: DataStr = getData();

  if (validateUserId(uId) === undefined) {
    return { error400: 'Invalid uId' };
  }

  let numGlobOwn = 0;
  for (const user of data.users) {
    if (user.globalPermsId === 1) {
      numGlobOwn++;
    }
  }

  if (numGlobOwn === 1) {
    return { error400: 'uId is the only global owner' };
  }

  for (const user of data.users) {
    if (user.userId === authUserId) {
      if (user.globalPermsId !== 1) {
        return { error403: 'authUserId is not a global owner' };
      }
    }
  }

  for (const channel of data.channels) {
    if (isMember(uId, channel)) {
      channelLeave(uId, channel.channelId);
    }
  }

  for (const dms of data.dms) {
    if (isDmMember(uId, dms)) {
      dmLeave(uId, dms.dmId);
    }
  }

  for (const msg of data.messages) {
    if (msg.uId === uId) {
      msg.message = 'Removed user';
    }
  }

  for (const user of data.users) {
    if (user.userId === uId) {
      userSetNameV1(uId, 'Removed', 'user');
    }
  }

  return {};
}

const isAlphaNumeric = (str: string) => /^[A-Za-z0-9]+$/gi.test(str);
