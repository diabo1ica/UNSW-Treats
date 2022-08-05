import { getData, setData, Message, VALIDREACTS } from './dataStore';
import { getChannel, isDmMember, getDm, getMessage, isMember, getChannelPerms, MEMBER, getDmPerms, getReact, isReacted, getGlobalPerms } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { reactNotifCh } from './notification';

/*
Marked a given message that refer to messageId as "pinned"

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    messageId (number)     - Identification number of the message which will be pinned

Return Value:
    Returns {} on valid/active token, messageId refer to valid message, message is not yet pinned, messagedID refer to
    a valid message and authUserId have user permission
    Returns {error400} on messageId does not refer to valid message
    Returns {error400} on message already pinned
    Returns {error403} on messageId is valid but authUserId does not have user permission
*/

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

/*
Add a 'react" to a message that refer to messageId

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    messageId (number)     - Identification number of the message which will be reacted
    reactId (number)       - Identification number of the reaction

Return Value:
    Returns {} on valid/active token, messageId refer to valid message, valid reactId, the message
    has not contain a react with ID reactId from authUserId
    Returns {error400} on messageId does not refer to valid message
    Returns {error400} on invalid reactId
    Returns {error400} on the message contain a react with ID reactId from authUserId
*/

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
