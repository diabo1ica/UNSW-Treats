import HTTPError from 'http-errors';
import { getData, setData, DataStr, Channel, Message, User, Dm } from './dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { channelMessageTemplate, getGlobalPerms, OWNER } from './util';
import { isReacted, getChannelMessages, sortMessages, generateMessageId } from './util';
import { validateUserId, getChannel, getDm, isMember, isDmMember, MEMBER } from './util';
import { isChannelOwner, isDmOwner, isSender, getCurrentTime } from './util';
import { chInviteNotif, tagNotifCh, tagNotifChEdit, tagNotifDmEdit } from './notification';

// Display channel details of channel with channelId
// Arguements:
//    authUserId (number)   - User id of user trying to access channel details
//    channelId (number)    - Channel id of the channel that will be inspected
// Return value:
//    Returns {
//      name: <string>,           on valid authUserId and channelId
//      isPublic: <bool>,
//      ownerMembers: <array>,
//      alMembers: <array>
//    }
//    Returns { error : 'error' } on invalid authUserId (authUserId does not have correct permission
//    Returns { error : 'error' } on invalid channnelId (channelId does not exist)
export function channelDetailsV1(authUserId: number, channelId: number) {
  const data: DataStr = getData();
  if (!data.channels.some(obj => obj.channelId === channelId)) {
    return { error400: 'Invalid channel id' };
  }
  let object: Channel;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      object = channel;
      break;
    }
  }
  if (!object.members.some(obj => obj.uId === authUserId)) {
    return { error403: 'Invalid uid' };
  }
  // Filter owmer members in members array
  const owner = [];
  const members = [];
  for (const memberObj of object.members) {
    for (const user of data.users) {
      if (user.userId === memberObj.uId) {
        const member = {
          uId: user.userId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        };
        if (memberObj.channelPermsId === 1) {
          owner.push(member);
        }
        members.push(member);
      }
    }
  }
  setData(data);
  return {
    name: object.name,
    isPublic: object.isPublic,
    ownerMembers: owner,
    allMembers: members
  };
}

/*
The authorised user joins the channel using channelId given.

Arguments:
    authUserId (integer) - Id of user that is joining the channel
    channelId  (integer) - Id of channel that user wants to joining

Return Value:
    Returns {} on joining channel
*/
export function channelJoinV1(authUserId: number, channelId: number) {
  const data: DataStr = getData();
  let userObj: User;
  const channelObj: Channel = getChannel(channelId);

  // find info about authuser
  for (const newMember of data.users) {
    if (newMember.userId === authUserId) {
      userObj = newMember;
      break;
    }
  }

  if (channelObj === undefined) {
    throw HTTPError(INPUT_ERROR, 'channel is not found');
  }

  if (isMember(authUserId, getChannel(channelId)) === true) {
    throw HTTPError(INPUT_ERROR, 'already joined channel');
  }

  if (channelObj.isPublic === false && userObj.globalPermsId === 2) {
    throw HTTPError(AUTHORISATION_ERROR, 'cannot join private channel');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.members.push({
        uId: authUserId,
        channelPermsId: MEMBER,
      });
      setData(data);
      return ({});
    }
  }
}

/*
Invite other uId to join channel with specified channelId

Arguments:
    authUserId (integer)  - author user id, the user that create the channel
                            and a member of channel.
    channelId (integer)   - the channelId of the channel where other user will
                            be invited to join.
    uId (integer)         - the user id of user that will be invited.

Return Value:
    Returns {} on valid uId, authUserId and channelId
    Returns {error: 'error'} on channelId is invalid
    Returns {error: 'error'} on uId is invalid
    Returns {error: 'error'} on uId is already a member
    Returns {error: 'error'} on channelId is valid but authUserId is
                             not a member
*/
export function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  const data: DataStr = getData();
  const channelObj = getChannel(channelId);
  if (getChannel(channelId) === undefined) {
    return { error400: 'Invalid ChannelId' };
  }
  if (!validateUserId(uId) || channelObj === undefined) {
    return { error400: 'uId does not refer to valid user' };
  } if (isMember(uId, channelObj)) {
    return { error400: 'uId is already a member' };
  }
  if (!isMember(authUserId, channelObj)) {
    return { error403: 'ChannelId is valid but authUserId is not a member' };
  }

  for (const item of data.users) {
    if (item.userId === uId) {
      channelObj.members.push({
        uId: uId,
        channelPermsId: 2,
      });
    }
  }
  chInviteNotif(authUserId, channelId, uId);
  return {};
}

/*
Displays the list of messages of a given channel, and indicates whether there
are more messages to load or if it has loaded all least recent messages.

Arguments:
    authUserId (integer)   - Identification number of the user calling the
                             function.
    channelId (integer)    - Identification number of the channel whose messages
                             are to be viewed.
    start (integer)        - The starting index of which the user wants to start
                             looking at the messages from.

Return Value:
    Returns {messages, start, end} on correct input
    Returns {error400} on authUserId is invalid
    Returns {error400} on start is greater than the total amount of
    messages
    Returns {error400} on channelId is invalid
    Returns {error403} on channelId is valid but authUserId is not a
    member of the channel
*/

export function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const data = getData();
  const channelObj = getChannel(channelId);
  sortMessages(data.messages);
  if (channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid channel');
  const channelMessagesArr: Message[] = JSON.parse(JSON.stringify(getChannelMessages(channelId)));
  if (start > channelMessagesArr.length) throw HTTPError(INPUT_ERROR, 'Start is greater than message count');
  if (!isMember(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'User is not a member of the channel');
  for (const message of channelMessagesArr) {
    delete message.channelId;
    delete message.dmId;
    message.reacts.forEach(react => { react.isThisUserReacted = isReacted(authUserId, message, react.reactId); });
  }
  let end: number;
  if (start + 50 >= channelMessagesArr.length) {
    end = -1;
  } else {
    end = start + 50;
  } // Determine whether there are more messages in the channel after the first 50 from start.
  setData(data);
  return {
    messages: channelMessagesArr.slice(start, start + 50), // extract the 50 most recent messages relative to start from the channel
    start: start,
    end: end,
  };
}

/*
add user as owner of the channel

Arguments:
    authUserId (integer)   - Identification number of the user calling the
                             function.
    channelId (integer)    - Identification number of the channel whose messages
                             are to be viewed.
    uId (integer)        - user that being add as owner

Return Value:
    Returns {} when uId is added as owner succesfully.
    Returns {error: 'error'} on invalid channelId, invalid uId, user is not a member
*/
export function channelAddownerV1(authUserId: number, channelId: number, uId: number) {
  const data: DataStr = getData();

  // checking if uId is not valid
  if (!validateUserId(uId)) {
    throw HTTPError(INPUT_ERROR, 'uId is invalid');
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check is uId is not member
      if (isMember(uId, channel) === false) throw HTTPError(INPUT_ERROR, 'uId is not a member of channel');
      // check if uId already owner
      if (isChannelOwner(uId, channel) === true) throw HTTPError(INPUT_ERROR, 'uId already an owner of channel');
      // check authuserId is not owner
      if (isChannelOwner(authUserId, channel) === false && getGlobalPerms(authUserId) === MEMBER) throw HTTPError(AUTHORISATION_ERROR, 'permission restricted');
      // global owner cannot add theirself as owner
      if (getGlobalPerms(authUserId) === OWNER && authUserId === uId) throw HTTPError(AUTHORISATION_ERROR, 'global onwer cannot selfpromote');
      for (const item of channel.members) {
        if (item.uId === uId) {
          item.channelPermsId = OWNER;
          setData(data);
          return {};
        }
      }
    }
  }

  throw HTTPError(INPUT_ERROR, 'channelId is invalid');
}

/*
sends a message to channel,

Arguments:
    authUserId (number)    - user calling the function
    channelId (number)  - Identification of channel that the message
                        is sent.
    message (string)   - string of message that is sent.

Return Value:
    Returns { messageId } unique identification for the message on success
    Returns {error: 'error'} on invalid channelId, incorrect message length,
                            messageId being valid, but not included in channel that
                            usr is a part of.
*/
export function messageSendV1(authUserId: number, channelId: number, message: string) {
  const data: DataStr = getData();
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
  tagNotifCh(authUserId, message, channelId);
  return { messageId: data.messageIdCounter };
}

/*
edit message correspoding to messageId

Arguments:
    authUserId (number)    - user calling the function
    channelId (number)  - Identification of channel that the message
                        is edited.
    message (string)   - string of message that is sent to be edited.

Return Value:
    Returns {} when message is edited succesfully
    Returns {error: 'error'} on incorrect message length, invalid messageId,
                              not the user who sent the message, no owner permission
                              to edit other's message.
*/
export function messageEditV1(authUserId: number, messageId: number, message: string) {
  const data: DataStr = getData();
  let channelObj: Channel;
  let dmObj: Dm;

  if (message.length > 1000) {
    throw HTTPError(INPUT_ERROR, 'message length exceeded 1000');
  }

  // call message remove if message is empty string
  if (message === '') {
    return messageRemoveV1(authUserId, messageId);
  }

  // loop to search for messageId
  for (const item of data.messages) {
    if (item.messageId === messageId) {
      // messageId is found in dm
      if (item.channelId === undefined) {
        dmObj = getDm(item.dmId);
        if (isDmOwner(authUserId, dmObj) === true) {
          tagNotifDmEdit(authUserId, item.message, message, item.dmId);
          item.message = message;
          setData(data);
          return ({});
        }
        if (isDmMember(authUserId, dmObj) === false) {
          throw HTTPError(INPUT_ERROR, 'not a member of dm');
        }
        if (isSender(authUserId, messageId) === true) {
          tagNotifDmEdit(authUserId, item.message, message, item.dmId);
          item.message = message;
          setData(data);
          return ({});
        }
        if (isSender(authUserId, messageId) === false) {
          throw HTTPError(AUTHORISATION_ERROR, 'you have no permission to edit message');
        }
      } else {
        channelObj = getChannel(item.channelId);
        if (isChannelOwner(authUserId, channelObj) === true) {
          tagNotifChEdit(authUserId, item.message, message, item.channelId);
          item.message = message;
          setData(data);
          return ({});
        }
        if (isMember(authUserId, channelObj) === false) {
          throw HTTPError(INPUT_ERROR, 'not a member of channel');
        }
        if (isSender(authUserId, messageId) === true) {
          tagNotifChEdit(authUserId, item.message, message, item.channelId);
          item.message = message;
          setData(data);
          return ({});
        }
        if (isSender(authUserId, messageId) === false) {
          throw HTTPError(AUTHORISATION_ERROR, 'you have no permission to edit message');
        }
      }
    }
  }
  throw HTTPError(INPUT_ERROR, 'invalid messageId');
}

/*
remove message correspoding to messageId

Arguments:
    authUserId (number)    - user calling the function
    messageId (number)  - Identification of channel that the message
                        is removed.

Return Value:
    Returns {} when message is removed succesfully
    Returns {error: 'error'} on invalid messageId,  not the user who sent the
                              message, have no ownerpermsion to remove message.
*/
export function messageRemoveV1(authUserId: number, messageId: number) {
  const data: DataStr = getData();
  let channelObj: Channel;
  let dmObj: Dm;
  let index = 0;
  for (const item of data.messages) {
    if (item.messageId === messageId) {
      // messageId is found in dm
      if (item.channelId === undefined) {
        dmObj = getDm(item.dmId);
        if (isDmOwner(authUserId, dmObj) === true) {
          data.messages.splice(index, 1);
          setData(data);
          return ({});
        }
        if (isDmMember(authUserId, dmObj) === false) {
          throw HTTPError(INPUT_ERROR, 'not a member of dm');
        }
        if (isSender(authUserId, messageId) === true) {
          data.messages.splice(index, 1);
          setData(data);
          return ({});
        }
        if (isSender(authUserId, messageId) === false) {
          throw HTTPError(AUTHORISATION_ERROR, 'you have no permission to remove message');
        }
      } else {
        channelObj = getChannel(item.channelId);
        if (isChannelOwner(authUserId, channelObj) === true) {
          data.messages.splice(index, 1);
          setData(data);
          return ({});
        }
        if (isMember(authUserId, channelObj) === false) {
          throw HTTPError(INPUT_ERROR, 'not a member of channel');
        }
        if (isSender(authUserId, messageId) === true) {
          data.messages.splice(index, 1);
          setData(data);
          return ({});
        }
        if (isSender(authUserId, messageId) === false) {
          throw HTTPError(AUTHORISATION_ERROR, 'you have no permission to remove message');
        }
      }
      index++;
    }
    index++;
  }
  // messageId not found in user's channels/dms
  throw HTTPError(INPUT_ERROR, 'invalid messageId');
}

/*
Removes owner permissions from the given uId.

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)    - Identification number of the channel being
                            edited
    uId (number)    - Identification number of the owner whose permissions
                      are to be replaced with member permissions

Return Value:
    Returns {} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token, invalid userId, uId
    refers to a user who is not an owner of the channel, uId refers to a user
    who is the only owner of the channel, authorised user does not have owner
    permissions
*/

export function removeowner (authUserId: number, channelId: number, uId: number) {
  const channelObj = getChannel(channelId);
  if (!validateUserId(uId) || channelObj === undefined) {
    return { error400: 'Invalid Uid or Invalid ChannelId' };
  } if (!isMember(uId, channelObj) || !isMember(authUserId, channelObj)) {
    return { error400: 'Uid is a member or authUserId is not a member' };
  }

  let num = 0;
  for (const member of channelObj.members) {
    if (member.channelPermsId === 1) {
      num++;
    }
  }

  for (const member of channelObj.members) {
    if (member.uId === authUserId && member.channelPermsId === 2) {
      return { error403: 'ChannelId is valid but authUserId is not the owner' };
    }
    if (member.uId === uId) {
      if (member.channelPermsId === 2 || num === 1) {
        return { error400: 'uId is not an owner of the channel or uId is the only owner of the channel' }; // if user doesn't have owner permissions return error
      } else {
        member.channelPermsId = 2; // set the user's permissions to member permissions
      }
    }
  }

  return {};
}

export function messageSendlaterv1 (authUserId: number, channelId: number, message: string, timeSent: number) {
  const data = getData();
  const channelObj = getChannel(channelId);
  if (channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  if (message.length < 1) throw HTTPError(INPUT_ERROR, 'Empty message');
  if (message.length > 1000) throw HTTPError(INPUT_ERROR, 'Message greater than 1000 characters');
  if (timeSent < getCurrentTime()) throw HTTPError(INPUT_ERROR, 'Cannot send message into the past!');
  if (!isMember(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'Not a member of the channel');
  const newMessage = channelMessageTemplate();
  newMessage.messageId = generateMessageId();
  newMessage.timeSent = timeSent;
  newMessage.message = message;
  newMessage.uId = authUserId;
  newMessage.channelId = channelId;
  data.messages.unshift(newMessage);
  setData(data);
  return {
    messageId: newMessage.messageId
  };
}

/*
Wrapper function for the /channel/leave/v1 implementation
Arguements :
    - token (string)      - A token of the user that will leave the channel
    - chId (number)       - The id of the channel
Return values :
    - Returns {} once removal is done
    - Returns { error400: 'error' } if the token/uid does not exist in the dataStore
    - Returns { error400: 'error  } if chId does not exist in the channels array
    - Returns { error403: 'error' } if the token points to a uid that doesn't exist in the channel's members array
*/
export function channelLeave(userId: number, chId: number) {
  const data: DataStr = getData();
  // Find channel in channel array
  for (const channel of data.channels) {
    if (channel.channelId === chId) {
      // Find userId in channel's member array
      for (let i = 0; i < channel.members.length; i++) {
        if (channel.members[i].uId === userId) {
          channel.members.splice(i, 1);
          setData(data);
          return {};
        }
      }
      return { error403: 'error' };
    }
  }
  return { error400: 'error' };
}
