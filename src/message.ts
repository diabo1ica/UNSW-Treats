import { getData, setData, Message, VALIDREACTS } from './dataStore';
import { getChannel, isDmMember, getDm, getMessage, isMember, getChannelPerms, MEMBER, getDmPerms, getReact, isReacted } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';

export function messagePin(authUserId: number, messageId: number) {
  const messageObj = getMessage(messageId);
  if (messageObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid message');
  if (messageObj.isPinned) throw HTTPError(INPUT_ERROR, 'Message already pinned');
  if (messageObj.channelId !== undefined) return channelPin(authUserId, messageObj);
  else return dmPin(authUserId, messageObj);
}

function dmPin(authUserId: number, messageObj: Message) {
  const data = getData();
  const dm = getDm(messageObj.dmId);
  if (!isDmMember(authUserId, dm)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM');
  if (getDmPerms(authUserId, dm) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, "Authorised user is doesn't have owner permissions");
  messageObj.isPinned = true;
  setData(data);
  return {};
}

export function messageReact(authUserId: number, messageId: number, reactId: number) {
  const message = getMessage(messageId);
  if (message === undefined) throw HTTPError(INPUT_ERROR, 'Invalid message'); // Message isn't valid
  if (!VALIDREACTS.some(react => react === reactId)) throw HTTPError(INPUT_ERROR, 'Invalid react'); // React is not valid
  if (isReacted(authUserId, message, reactId)) throw HTTPError(INPUT_ERROR, 'Authorised user already used react in message');
  if (message.channelId !== undefined) return channelReact(authUserId, message, reactId);
  else return dmReact(authUserId, message, reactId);
}

function channelPin(authUserId: number, messageObj: Message) {
  const data = getData();
  const channel = getChannel(messageObj.channelId);
  if (!isMember(authUserId, channel)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  if (getChannelPerms(authUserId, channel) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, "Authorised user doesn't have owner permissions");
  messageObj.isPinned = true;
  setData(data);
  return {};
}

function channelReact(authUserId: number, messageObj: Message, reactId: number) {
  const data = getData();
  const channel = getChannel(messageObj.channelId);
  if (!isMember(authUserId, channel)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  const react = getReact(messageObj, reactId);
  if (react === undefined) {
    messageObj.reacts.push({
      reactId: reactId,
      uIds: [authUserId],
    });
    setData(data);
    return {};
  }
  react.uIds.push(authUserId);
  setData(data);
  return {};
}

function dmReact(authUserId: number, messageObj: Message, reactId: number) {
  const data = getData();
  const dm = getDm(messageObj.dmId);
  if (!isDmMember(authUserId, dm)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM');
  const react = getReact(messageObj, reactId);
  if (react === undefined) {
    messageObj.reacts.push({
      reactId: reactId,
      uIds: [authUserId],
    });
    setData(data);
    return {};
  }
  react.uIds.push(authUserId);
  setData(data);
  return {};
}
