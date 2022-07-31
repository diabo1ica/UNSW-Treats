import { getData, setData, DataStr, Channel, Message, User } from './dataStore';
import { validateUserId, getChannel, isMember } from './util';

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
The authorised user joins the channel using channelId given.

Arguments:
    authUserId (integer) - Id of user that is joining the channel
    channelId  (integer) - Id of channel that user wants to joining

Return Value:
    Returns {} on joining channel
*/
function channelJoinV1(authUserId: number, channelId: number) {
  const data: DataStr = getData();
  let obj: User;

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
  const data: DataStr = getData();
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
  const messagesArray: Message[] = [];
  if (start + 50 >= channelObj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  } // Determine whether there are more messages in the channel after the first 50 from start.
  for (const item of channelObj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  } // extract the 50 most recent messages relative to start from the channel

  return {
    messages: messagesArray,
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
function channelAddownerV1(authUserId: number, channelId: number, uId: number) {
  const data: DataStr = getData();
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

/*
sents a message to channel,

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
function messageSendV1(authUserId: number, channelId: number, message: string) {
  const data: DataStr = getData();
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
function messageEditV1(authUserId: number, messageId: number, message: string) {
  const data: DataStr = getData();

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
function messageRemoveV1(authUserId: number, messageId: number) {
  const data: DataStr = getData();

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

// check if owner permission
function isOwner(userId: number, channelObj: Channel) {
  // if (dm_obj === undefined) {
  for (const item of channelObj.members) {
    if (item.uId === userId && item.channelPermsId === 1) {
      return true;
    }
  }
  return false;
}
// helper function to edit message, reduce nesting
function editMessage(authUserId: number, messageId: number, message: string) {
  const data: DataStr = getData();
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

// helper function to remove message, reduce nesting
function removeMessage(authUserId: number, messageId: number) {
  const data: DataStr = getData();
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

// check if user is sent the message
function isSender(userId: number, messageId: number, channelObj: Channel) {
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
        return { error: 'error' }; // if user doesn't have owner permissions return error
      } else {
        member.channelPermsId = 2; // set the user's permissions to member permissions
      }
    }
  }

  return {};
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelAddownerV1, messageEditV1, messageSendV1, messageRemoveV1 };
