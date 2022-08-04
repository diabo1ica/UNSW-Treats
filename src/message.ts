import { getData, setData, Message, VALIDREACTS, DataStr, Channel, Dm } from './dataStore';
import { getChannel, isDmMember, getDm, getMessage, isMember, getReact, isReacted, isChannelOwner, isDmOwner } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { messageSendV1 } from './channel';
import { messageSendDm } from './dm';

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
  if (message.channelId !== undefined) {
    const channelObj = getChannel(message.channelId);
    if (!isMember(authUserId, channelObj)) throw HTTPError(INPUT_ERROR, 'Invalid message'); // message not accessible in channel
    if (!isChannelOwner(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'you are not owner'); // no owner permission
  } else {
    const dmObj = getDm(message.dmId);
    if (!isDmMember(authUserId, dmObj)) throw HTTPError(INPUT_ERROR, 'Invalid message'); // message not accessible in dm
    if (!isDmOwner(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'you are not owner'); // no owner permission
  }

  if (message.isPinned === false) throw HTTPError(INPUT_ERROR, 'Message is not pinned'); // message not pined

  message.isPinned = false;
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
  if (dmObj === undefined && channelId === -1) throw HTTPError(INPUT_ERROR, 'Invalid dmId or channelId');
  if (dmId === -1 && channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid dmId or channelId');
  if (dmId !== -1 && channelId !== -1) throw HTTPError(INPUT_ERROR, 'neither dmId nor channelId is -1');

  if (messageObj.channelId !== undefined) {
    if (!isMember(authUserId, getChannel(messageObj.channelId))) throw HTTPError(INPUT_ERROR, 'Invalid message');
  } else {
    if (!isDmMember(authUserId, getDm(messageObj.dmId))) throw HTTPError(INPUT_ERROR, 'Invalid message');
  }

  if (channelId === -1) {
    if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'no access to dm');
    messageSendDm(authUserId, dmId, messageObj.message + message);
  } else {
    if (!isMember(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'no access to channel');
    messageSendV1(authUserId, channelId, messageObj.message + message);
  }

  setData(data);
  return {};
}
