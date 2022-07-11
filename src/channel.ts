import { getData, setData, dataStr, channel, user, message } from './dataStore';

// Display channel details of channel with channelId
// Arguements:
//    authUserId (number)   - User id of user trying to access channel details
//    channelId (number)    - Channel id of the channel that will be inspected
// Return value:
//    Returns {
//      channelId: <number>,
//      name: <string>,           on valid authUserId and channelId
//      isPublic: <bool>,
//      members: <array>
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
  for (const user of object.members) {
    const member = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr
    };
    if (user.channelPermsId === 1) {
      owner.push(member);
    } else {
      members.push(member);
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
  let obj: user;

  for (const newMember of data.users) {
    if (newMember.userId === authUserId) {
      obj = newMember;
      break;
    }
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
        email: obj.email,
        nameFirst: obj.nameFirst,
        nameLast: obj.nameLast,
        handleStr: obj.handleStr,
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
  if (!validateUserId(uId) || channelObj === false) {
    return { error: 'error' };
  } else if (isMember(uId, channelObj) || !isMember(authUserId, channelObj)) {
    return { error: 'error' };
  }

  for (const item of data.users) {
    if (item.userId === uId) {
      channelObj.members.push({
        uId: uId,
        nameFirst: item.nameFirst,
        email: item.email,
        handleStr: item.handleStr,
        nameLast: item.nameLast,
        channelPermsId: 2,
      });
    }
  }

  setData(data);

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
  if (start + 50 > channelObj.messages.length) {
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
/*
Finds the channel described by the given channelId by iterating over the dataStore's
channels array.

Arguments:
    channelId (integer)    - Identification number of the channel whose info is to
                             be returned.

Return Value:
    Returns {channel object} on channel.Id matches channelId
    Returns {false} on no channels whose channelId matches the given channelId
*/
function getChannel(channelId: number) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}
/*
Checks if the given userId belongs to a user that is a member of the channel described
by the given channelId

Arguments:
    UserId (integer)       - Identification number of the user assumed to be a member of
                             the given channel.
    channelObj (integer)  - The channel object whose members array will be analysed to check
                             if the given user is a member.

Return Value:
    Returns {true} on userId found in the members array of channelObj
    Returns {false} on no userId found in the members array of channelObj
*/
function isMember(userId: number, channelObj:channel) {
  for (const item of channelObj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}
/*
Checks if the given userId is valid

Arguments:
    UserId (integer)   - Identification number of the user to be
                         validated.

Return Value:
    Returns {true} on userId was found in the dataStore's users array
    Returns {false} on userId was not found in the dataStore's users array
*/
function validateUserId(UserId: number) {
  const data: dataStr = getData();
  for (const item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
