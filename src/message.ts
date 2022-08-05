import { getData, setData, Message, VALIDREACTS, DataStr, Channel, Dm } from './dataStore';
import { isChannelOwner, isDmOwner, getCurrentTime, generateMessageId } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { getChannel, isDmMember, getDm, getMessage, isMember, getChannelPerms, MEMBER, getDmPerms, getReact, isReacted, getGlobalPerms } from './util';
import { reactNotifCh } from './notification';

/*
Unreact a react in message given reactId and messageId

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    messageId (number)    - Identification number of the message being
                            unreacted
    reactId (number)    - Identification of types of react

Return Value:
    Returns {} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token, invalid userId, messageId,
    reactId.
*/
export function messsageUnreactV1(authUserId: number, messageId: number, reactId: number) {
  const data: DataStr = getData();
  const message = getMessage(messageId);
  let index = 0;

  if (message === undefined) throw HTTPError(INPUT_ERROR, 'Invalid message'); // Message isn't valid
  if (message.channelId !== undefined) {
    const channelObj = getChannel(message.channelId);
    if (!isMember(authUserId, channelObj)) throw HTTPError(INPUT_ERROR, 'Invalid message');
  } else {
    const dmObj = getDm(message.dmId);
    if (!isDmMember(authUserId, dmObj)) throw HTTPError(INPUT_ERROR, 'Invalid message');
  }
  if (!VALIDREACTS.some(react => react === reactId)) throw HTTPError(INPUT_ERROR, 'Invalid react'); // React is not valid
  if (!isReacted(authUserId, message, reactId)) throw HTTPError(INPUT_ERROR, 'Authorised user has not reacted message');

  const react = getReact(message, reactId);
  for (let i = 0; i < react.uIds.length; i++) {
    if (react.uIds[index] === authUserId) {
      react.uIds.splice(index, 1);
      break;
    }
    index++;
  }

  setData(data);
  return {};
}

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
  if (getDmPerms(authUserId, dm) === MEMBER && getGlobalPerms(authUserId) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, "Authorised user is doesn't have owner permissions");
  messageObj.isPinned = true;
  setData(data);
  return {};
}

export function messageReact(authUserId: number, messageId: number, reactId: number) {
  const message = getMessage(messageId);
  if (message === undefined) throw HTTPError(INPUT_ERROR, 'Invalid message'); // Message isn't valid
  if (!VALIDREACTS.some(react => react === reactId)) throw HTTPError(INPUT_ERROR, 'Invalid react'); // React is not valid
  if (isReacted(authUserId, message, reactId)) throw HTTPError(INPUT_ERROR, 'Authorised user already used react in message');
  if (message.channelId !== undefined) return channelReact(authUserId, message, reactId, messageId);
  else return dmReact(authUserId, message, reactId, messageId);
}

function channelPin(authUserId: number, messageObj: Message) {
  const data = getData();
  const channel = getChannel(messageObj.channelId);
  if (!isMember(authUserId, channel)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  if (getChannelPerms(authUserId, channel) === MEMBER && getGlobalPerms(authUserId) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, "Authorised user doesn't have owner permissions");
  messageObj.isPinned = true;
  setData(data);
  return {};
}

/*
Unpin a message given messageId

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    messageId (number)    - Identification number of the message being
                            unpined

Return Value:
    Returns {} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token, invalid userId, messageId,
                                no owner permission
*/
export function messsageUnpinV1(authUserId: number, messageId: number) {
  const data: DataStr = getData();
  const message = getMessage(messageId);

  if (message === undefined) throw HTTPError(INPUT_ERROR, 'Invalid message'); // Message isn't valid
  if (message.isPinned === false) throw HTTPError(INPUT_ERROR, 'Message is not pinned'); // message not pined
  if (message.channelId !== undefined) {
    const channelObj = getChannel(message.channelId);
    if (!isMember(authUserId, channelObj)) throw HTTPError(INPUT_ERROR, 'no access to channel'); // message not accessible in channel
    if (!isChannelOwner(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'you are not owner'); // no owner permission
  } else {
    const dmObj = getDm(message.dmId);
    if (!isDmMember(authUserId, dmObj)) throw HTTPError(INPUT_ERROR, 'no access to dm'); // message not accessible in dm
    if (!isDmOwner(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'you are not owner'); // no owner permission
  }

  message.isPinned = false;
  setData(data);
  return {};
}

function channelReact(authUserId: number, messageObj: Message, reactId: number, messageId: number) {
  const data = getData();
  const channel = getChannel(messageObj.channelId);
  if (!isMember(authUserId, channel)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  reactNotifCh(authUserId, messageId);
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

export function messsageShareV1(authUserId: number, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data: DataStr = getData();
  const dmObj: Dm = getDm(dmId);
  const channelObj: Channel = getChannel(channelId);
  const messageObj: Message = getMessage(ogMessageId);

  if (messageObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid ogmessage');
  if (message.length > 1000) throw HTTPError(INPUT_ERROR, 'lenght is over 1000');
  if (dmObj === undefined && channelId === -1) throw HTTPError(INPUT_ERROR, 'Invalid dmId');
  if (dmId === -1 && channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid channelId');
  if (dmId !== -1 && channelId !== -1) throw HTTPError(INPUT_ERROR, 'neither dmId nor channelId is -1');
  const messageIdx = generateMessageId();

  if (messageObj.channelId !== undefined) {
    if (!isMember(authUserId, getChannel(messageObj.channelId))) throw HTTPError(AUTHORISATION_ERROR, 'no access to dm');
    data.messages.unshift({
      messageId: messageIdx,
      uId: authUserId,
      message: messageObj.message + message,
      timeSent: getCurrentTime(),
      isPinned: false,
      reacts: [],
      channelId: channelId,
      dmId: undefined,
    });
  } else {
    if (!isDmMember(authUserId, getDm(messageObj.dmId))) throw HTTPError(AUTHORISATION_ERROR, 'no access to channel');
    data.messages.unshift({
      messageId: messageIdx,
      uId: authUserId,
      message: messageObj.message + message,
      timeSent: getCurrentTime(),
      isPinned: false,
      reacts: [],
      channelId: undefined,
      dmId: dmId,
    });
  }

  setData(data);
  return { sharedMessageId: messageIdx };
}

function dmReact(authUserId: number, messageObj: Message, reactId: number, messageId: number) {
  const data = getData();
  const dm = getDm(messageObj.dmId);
  if (!isDmMember(authUserId, dm)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM');
  reactNotifCh(authUserId, messageId);
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
