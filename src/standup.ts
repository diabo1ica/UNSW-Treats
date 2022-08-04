import { getData, setData } from './dataStore';
import { getCurrentTime, getChannel, isMember } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
<<<<<<< HEAD
import { messageSendV1 } from './channel';
=======
>>>>>>> 29264aebc3802f3f5da6a9e79b3e22430f7cd2f7

export function startStandUp(authUserId: number, channelId: number, length: number) {
  const data = getData();
  let timeNow: number;
  const channelObj = getChannel(channelId);
  if (length < 0) throw HTTPError(INPUT_ERROR, 'Length cannot be negative');
  if (channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid Channel');
  if (!isMember(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  if (channelObj.standUp.timeFinish > (timeNow = getCurrentTime())) throw HTTPError(INPUT_ERROR, 'Active standup currently running');
  channelObj.standUp.timeFinish = length + timeNow;
  setData(data);
  return {
    timeFinish: channelObj.standUp.timeFinish,
  };
}

export function activeStandUp(uId: number, channelId: number) {
  const data = getData();
  const channel = data.channels.find(obj => obj.channelId === channelId);
  if (channel === undefined) throw HTTPError(INPUT_ERROR, 'Invalid channel');
  if (channel.members.find(user => user.uId === uId) === undefined) throw HTTPError(AUTHORISATION_ERROR, 'Invalid user');
  let isActive = false;
  let timeFinish = null;
  if (channel.standUp.timeFinish === undefined) {
    return {
      isActive: isActive,
      timeFinish: timeFinish
    };
  }
  if (channel.standUp.timeFinish > getCurrentTime()) {
    isActive = true;
  }
  timeFinish = channel.standUp.timeFinish;
  return {
    isActive: isActive,
    timeFinish: timeFinish
  };
}

export function sendStandUp(uId: number, channelId: number, message: string) {
  const data = getData();
  const channel = data.channels.find(obj => obj.channelId === channelId);
  if (channel === undefined) throw HTTPError(INPUT_ERROR, 'Invalid channel');
  if (channel.members.find(obj => obj.uId === uId) === undefined) throw HTTPError(AUTHORISATION_ERROR, 'Invalid user');
  if (channel.standUp.timeFinish === undefined) throw HTTPError(INPUT_ERROR, 'StandUp inactive');
  if (channel.standUp.timeFinish < getCurrentTime()) throw HTTPError(INPUT_ERROR, 'StandUp is over');
  const userName: string = data.users.find(obj => obj.userId === uId).handleStr;
  if (channel.standUp.messageId === 0) {
    message = userName + ': ' + message;
<<<<<<< HEAD
    channel.standUp.messageId = messageSendV1(uId, channelId, message).messageId;
=======
    channel.standUp.messageId = stUpMessageSend(uId, channelId, message).messageId;
>>>>>>> 29264aebc3802f3f5da6a9e79b3e22430f7cd2f7
  } else {
    for (const messageObj of data.messages) {
      if (messageObj.messageId === channel.standUp.messageId) {
        messageObj.message = messageObj.message + '\n' + userName + ': ' + message;
      }
    }
  }
  setData(data);
  return {};
}
<<<<<<< HEAD
=======

function stUpMessageSend(authUserId: number, channelId: number, message: string) {
  const data = getData();
  const channelObj = getChannel(channelId);
  if (message.length > 1000) {
    throw HTTPError(INPUT_ERROR, 'message length exceeded 1000');
  }
  if (message.length < 1) {
    throw HTTPError(INPUT_ERROR, 'message is empty');
  }

  // check validity of channelId
  if (channelObj === undefined) {
    throw HTTPError(INPUT_ERROR, 'channelId is invalid');
  }
  // check if authuserId is member of channel
  if (isMember(authUserId, channelObj) === false) {
    throw HTTPError(AUTHORISATION_ERROR, 'you are not a member of channel');
  }
  data.messageIdCounter += 1;
  data.messages.unshift({
    messageId: data.messageIdCounter,
    uId: authUserId,
    message: message,
    timeSent: getCurrentTime(),
    isPinned: false,
    reacts: [],
    channelId: channelId,
    dmId: undefined,
  });
  setData(data);
  return { messageId: data.messageIdCounter };
}
>>>>>>> 29264aebc3802f3f5da6a9e79b3e22430f7cd2f7
