import { getData, setData, dataStr, channel, member, user } from './dataStore';

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
function channelDetailsV1(authUserId, channelId) {
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
function channelJoinV1(authUserId, channelId) {
  const data: dataStr = getData();
  let obj: user;

  for (const new_member of data.users) {
    if (new_member.userId === authUserId) {
      obj = new_member;
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
<<<<<<< HEAD

function channelInviteV1(authUserId, channelId, uId) {
  
  if (getChannel(channelId) === false) {
    return {error: 'error'};
  }
  if (validateUserId(uId) === false || validateUserId(authUserId) === false) {
    return {error: 'error'};
  }
  const channel_obj = getChannel(channelId);
  if (isMember(uId, channel_obj)) {
    return {error: 'error'};
  } 

  if (getChannel(channelId) === true) {
    if (isMember(authUserId, channel_obj) === false) {
      return {error: 'error'};
    }
  }
  
  for (let item of data.users) {
    if (item.userId === uId) {
      channel_obj.members.push({
        uId: uId,
        email: item.email,
        nameFirst: item.nameFirst,
        nameLast: item.nameLast,
        handleStr: item.handleStr,
        channelPermsId: 2,
      });
    }
  }  
    
=======
function channelInviteV1(authUserId, channelId, uId) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (channelId !== item.channelId) {
      return { error: 'error' };
    }
    for (const member of item.members) {
      if (uId === member.uId) {
        return { error: 'error' };
      }
      if (channelId === item.channelId && authUserId !== member.uId) {
        return { error: 'error' };
      }
    }
  }

  if (validateUserId(uId) == false) {
    return { error: 'error' };
  }

  const channeltemp: channel = channelsTemplate();
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channeltemp.name = channel.name;
      channeltemp.isPublic = channel.isPublic;
      for (const item of data.users) {
        if (item.userId === uId) {
          channeltemp.members.push({
            uId: uId,
            email: item.email,
            nameFirst: item.nameFirst,
            nameLast: item.nameLast,
            handleStr: item.handleStr,
            channelPermsId: 2,
          });
        }
      }
    }
  }

  data.channels.push(channeltemp);
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
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
function channelMessagesV1(authUserId, channelId, start) {
  const data: dataStr = getData();

  const channel_obj = getChannel(channelId);
  if (channel_obj === false) {
    return {
      error: 'error',
    };
  } else if (start > channel_obj.messages.length) {
    return {
      error: 'error'
    };
  } else if (isMember(authUserId, channel_obj) === false) {
    return {
      error: 'error'
    };
  }
  let end: number;
  const messagesArray: string[] = [];
  if (start + 50 > channel_obj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  }
  for (const item of channel_obj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  }

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

function getChannel(channelId) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

function isMember(userId, channel_obj) {
  const data: dataStr = getData();
  for (const item of channel_obj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}

<<<<<<< HEAD
function validateUserId(UserId: number) {
=======
function validateUserId(UserId) {
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
  const data: dataStr = getData();
  for (const item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

function channelsTemplate() {
  const channel: channel = {
    channelId: 0,
    name: ' ',
    isPublic: true,
    members: [],
    messages: [],
  };
  return channel;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
