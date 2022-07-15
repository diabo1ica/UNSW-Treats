import { getData, setData, dataStr, channel, member, user, message, dm } from './dataStore';

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
function channelDetailsV1(authUserId: number, channelId: number) {
  const data: dataStr = getData();
  if (!data.channels.some(obj => obj.channelId === channelId)) {
    return { error: 'error' };
  }
  let object: channel;
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      object = channel;
      break;
    }
  }
  if (!object.members.some(obj => obj.uId === authUserId)) {
    return { error: 'error' };
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
        } else {
          members.push(member);
        }
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
function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  const data: dataStr = getData();
  const channelObj = getChannel(channelId);
  if (getChannel(channelId) === false) {
    return { error: 'error' };
  }
  if (!validateUserId(uId) || channelObj === false) {
    return { error: 'error' };
  } if (isMember(uId, channelObj) || !isMember(authUserId, channelObj)) {
    return { error: 'error' };
  }

  for (const item of data.users) {
    if (item.userId === uId) {
      channelObj.members.push({
        uId: uId,
        channelPermsId: 2,
      });
    }
  }

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
    Returns {error: 'error'} on authUserId is invalid
    Returns {error: 'error'} on start is greater than the total amount of
    messages
    Returns {error: 'error'} on channelId is invalid
    Returns {error: 'error'} on channelId is valid but authUserId is not a
    member of the channel
*/

function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const channelObj = getChannel(channelId);
  if (validateUserId(authUserId) === false) {
    throw new Error('Invalid authUserId');
  } else if (channelObj === false) {
    throw new Error('Invalid channelId');
  } else if (start > channelObj.messages.length) {
    throw new Error('Start is ahead of final message');
  } else if (isMember(authUserId, channelObj) === false) {
    throw new Error('User is not a member of the channel');
  }
  let end: number;
  const messagesArray: message[] = [];
  if (start + 50 >= channelObj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  }
  for (const item of channelObj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  }

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

function channelAddownerV1(authUserId: number, channelId: number, uId: number) {
  const data: dataStr = getData();
  // const channelObj = getChannel(channelId);

  // checking if uId is not valid
  if (!validateUserId(uId)) {
    return { error: 'error' };
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check is uId is not member
      if (isMember(uId, channel) === false) return { error: 'error' };
      // check if uId already owner
      if (isOwner(uId, channel) === true) return { error: 'error' };
      // check authuserId is not owner
      if (isOwner(authUserId, channel) === false) return { error: 'error' };

      for (const item of channel.members) {
        if (item.uId === uId) {
          item.channelPermsId = 1;
          setData(data);
          return {};
        }
      }

      return { error: 'error' };
    }
  }

  return { error: 'error' };
}

function messageSendV1(authUserId: number, channelId: number, message: string) {
  const data: dataStr = getData();
  const channelObj = getChannel(channelId);
  const currTime: number = parseInt(new Date().toISOString());
  if (message.length > 1000) {
    return { error: 'error' };
  }
  if (message.length < 1) {
    return { error: 'error' };
  }

  // check validity of channelId
  if (channelObj === false) {
    return { error: 'error' };
  }
  // check if authuserId is member of channel
  if (isMember(authUserId, channelObj) === false) {
    return { error: 'error' };
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      data.messageIdCounter += 1;
      channel.messages.push({
        messageId: data.messageIdCounter,
        uId: authUserId,
        message: message,
        timeSent: currTime,
      });
      setData(data);
      return { messageId: data.messageIdCounter };
    }
  }
  return { error: 'error' };
}

function messageEditV1(authUserId: number, messageId: number, message: string) {
  const data: dataStr = getData();

  if (message.length > 1000) {
    return { error: 'error' };
  }
  // check if messageId is in channel, if not check in dm
  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // check if user is member in channel
      if (!isMember(authUserId, channel)) {
        return { error: 'error' };
      }
      if (isOwner(authUserId, channel)) {
        return editMessage(authUserId, messageId, message);
      }
      if (!isSender(authUserId, messageId, channel)) {
        return { error: 'error' };
      }
    }
  }
  // check for messageId in dm
  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      for (const item of dm.members) {
        if (item.uId === authUserId && item.dmPermsId === 1) {
          return editMessage(authUserId, messageId, message);
        }
      }
      // check if user is in dm
      for (const item1 of dm.members) {
        if (item1.uId !== authUserId) {
          return { error: 'error' };
        }
      }
      // check if is original sender
      for (const item2 of dm.messages) {
        if (item2.messageId === messageId && item2.uId !== authUserId) {
          return { error: 'error' };
        }
      }
    }
  }

  return { error: 'error' };
}

function messageRemoveV1(authUserId: number, messageId: number) {
  const data: dataStr = getData();

  // check if messageId is in channel, if not check in dm
  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // check if user is member in channel
      if (!isMember(authUserId, channel)) {
        return { error: 'error' };
      }
      if (isOwner(authUserId, channel)) {
        return removeMessage(authUserId, messageId);
      }
      if (!isSender(authUserId, messageId, channel)) {
        return { error: 'error' };
      }
    }
  }
  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      for (const item of dm.members) {
        if (item.uId === authUserId && item.dmPermsId === 1) {
          return removeMessage(authUserId, messageId);
        }
      }
      // check if user is in channel
      for (const item1 of dm.members) {
        if (item1.uId !== authUserId) {
          return { error: 'error' };
        }
      }
      // check if is original sender
      for (const item2 of dm.messages) {
        if (item2.messageId === messageId && item2.uId !== authUserId) {
          return { error: 'error' };
        }
      }
    }
  }
  // messageId not found in user's channels/dms
  return { error: 'error' };
}

/*
The authorised user joins the channel using channelId given.

Arguments:
    authUserId (integer) - Id of user that is joining the channel
    channelId  (integer) - Id of channel that user wants to joining

Return Value:
    Returns {} on joining channel
*/
function channelJoinV1(authUserId: number, channelId: number) {
  const data: dataStr = getData();
  let obj: user;

  for (const newMember of data.users) {
    if (newMember.userId === authUserId) {
      obj = newMember;
      break;
    }
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check if user is already a member
      for (const item of channel.members) {
        if (item.uId === authUserId) {
          return { error: 'error' };
        }
      }
      // check if user is global owner
      if (obj.globalPermsId === 1) {
        channel.members.push({
          uId: authUserId,
          channelPermsId: 2,
        });

        setData(data);
        return ({});
      }
      // check if channel is private
      if (channel.isPublic === false) {
        return { error: 'error' };
      }
      channel.members.push({
        uId: authUserId,
        channelPermsId: 2,
      });

      setData(data);
      return {};
    }
  }
  return { error: 'error' };
}

function getChannel(channelId: number) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

function isMember(userId: number, channelObj: channel) {
  for (const item of channelObj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}

function validateUserId(UserId: number) {
  const data: dataStr = getData();
  for (const item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

function isOwner(userId: number, channelObj: channel) {
  // if (dm_obj === undefined) {
  for (const item of channelObj.members) {
    if (item.uId === userId && item.channelPermsId === 1) {
      return true;
    }
  }
  return false;
}

function editMessage(authUserId: number, messageId: number, message: string) {
  const data: dataStr = getData();
  let index = 0;

  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      if (message === '') {
        for (const item of channel.messages) {
          if (item.messageId === messageId) {
            channel.messages.splice(index, 1);
          }
          index++;
        }
      } else {
        for (const item of channel.messages) {
          if (item.messageId === messageId) {
            item.message = message;
          }
        }
      }
    }
  }

  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      if (message === '') {
        for (const item of dm.messages) {
          if (item.messageId === messageId) {
            dm.messages.splice(index, 1);
          }
          index++;
        }
      } else {
        for (const item of dm.messages) {
          if (item.messageId === messageId) {
            item.message = message;
          }
        }
      }
    }
  }
  setData(data);
  return ({});
}

function removeMessage(authUserId: number, messageId: number) {
  const data: dataStr = getData();
  let index = 0;

  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      for (const item of channel.messages) {
        if (item.messageId === messageId) {
          channel.messages.splice(index, 1);
          break;
        }
        index++;
      }
    }
  }

  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      for (const item of dm.messages) {
        if (item.messageId === messageId) {
          dm.messages.splice(index, 1);
          break;
        }
        index++;
      }
    }
  }
  setData(data);
  return ({});
}

function isSender(userId: number, messageId: number, channelObj: channel) {
  for (const item of channelObj.messages) {
    if (item.messageId === messageId) {
      if (item.uId === userId) {
        return true;
      }
    }
  }
  return false;
}

/*
function channelsTemplate() {
  const channel: channel = {
    channelId: 0,
    name: ' ',
    isPublic: true,
    members: [],
    messages: [],
  };
  return channel;
} */

export function removeowner (authUserId: number, channelId: number, uId: number) {
  const channelObj = getChannel(channelId);
  if (!validateUserId(uId) || channelObj === false) {
    return { error: 'error' };
  } if (isMember(uId, channelObj) || !isMember(authUserId, channelObj)) {
    return { error: 'error' };
  }

  let num = 0;
  for (const member of channelObj.members) {
    if (member.channelPermsId === 1) {
      num++;
    }
  }

  for (const member of channelObj.members) {
    if (member.uId === uId) {
      if (member.channelPermsId === 2 || num === 1) {
        return { error: 'error' };
      } else {
        member.channelPermsId = 2;
      }
    }
  }

  return {};
}

export { channelJoinV1, channelAddownerV1, messageEditV1, messageSendV1, messageRemoveV1, channelDetailsV1, channelInviteV1, channelMessagesV1 };
