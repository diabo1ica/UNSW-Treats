import { getData, setData, dataStr, channel, message } from './dataStore';

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
The authorised user joins the channel using channelId given.

Arguments:
    authUserId (integer) - Id of user that is joining the channel
    channelId  (integer) - Id of channel that user wants to joining

Return Value:
    Returns {} on joining channel
*/
function channelJoinV1(authUserId: number, channelId: number) {
  const data: dataStr = getData();

  if (validateUserId(authUserId) === false) {
    return { error: 'error' };
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.isPublic === false) {
        return { error: 'error' };
      }
      for (const item of channel.members) {
        if (item.uId === authUserId) {
          return { error: 'error' };
        }
      }
      channel.members.push({
        uId: authUserId,
        channelPermsId: 2,
      });
      data.channels.push();
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

// Validates the dmId refers to a registered DM
function getChannel(channelId: number) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

// Validates that the user is a member of the given channel
function isMember(userId: number, channelObj: channel) {
  for (const item of channelObj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}

// Validates the given userId is a registered user
function validateUserId(UserId: number) {
  const data: dataStr = getData();
  for (const item of data.users) {
    if (item.userId === UserId) {
      return true;
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

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
