import { getData, setData } from './dataStore';
import { getCurrentTime, getChannel, isMember } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';

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
    channel.standUp.messageId = stUpMessageSend(uId, channelId, message).messageId;
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

function stUpMessageSend(authUserId: number, channelId: number, message: string) {
  const data = getData();
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
