import { getData, setData, Message, VALIDREACTS } from './dataStore';
import { getChannel, isDmMember, getDm, getMessage, isMember, getChannelPerms, MEMBER, getDmPerms, getReact, isReacted,} from './util';
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

function channelPin(authUserId: number, messageObj: Message) {
  const data = getData();
  const channel = getChannel(messageObj.channelId);
  if (!isMember(authUserId, channel)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  if (getChannelPerms(authUserId, channel) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, "Authorised user doesn't have owner permissions");
  messageObj.isPinned = true;
  setData(data);
  return {};
}