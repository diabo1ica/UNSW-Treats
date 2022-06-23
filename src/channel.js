import { getData, setData } from './dataStore.js';

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
  const data = getData();
  if(!data.channels.some(obj => obj.channelId === channelId)){;
    return { error: 'error' };
  }
  let object;
  for(const channel of data.channels){
    if(channel.channelId === channelId){
      object = channel;
      break;
    }
  }
  if(!object.members.some(obj => obj.uId === authUserId)){
    return { error: 'error' };
  }
  setData(data);
  return {
    channelId: object.channelId,
    name: object.name, 
    isPublic: object.isPublic,
    members: object.members
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();
  for (let item of data.channels) {
    if (channelId !== item.channelId) {
      return {error: 'error'};
    }
    for (let member of item.members) {
      if (uId === member.uId) {
        return {error: 'error'};
      }
      if (channelId === item.channelId && authUserId !== member.uId) {
        return {error: 'error'};
      }
    }
  }
  
  if (validateUserId(uId) == false) {
    return {error: 'error'};
  }
  
  const channeltemp = channelsTemplate();
  for (let channel of data.channels) {
    if (channelId === channel.channelId) {
      channeltemp.name = channel.name;
      channeltemp.isPublic = channel.isPublic;  
      for (let item of data.users) {
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
  const data = getData(); 
  
  const channel_obj = getChannel(channelId);
  if (channel_obj === false) {
    return {
      error: 'error',
    }
   
  } else if (start > channel_obj.messages.length) {
    return {
      error: 'error'
    }
  } else if (isMember(authUserId, channel_obj) === false) {
    return {
      error: 'error'
    }
  }
  let end;
  const messagesArray = [];
  if (start + 50 > channel_obj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  }
  for (let item of channel_obj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  }
  
  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

function getChannel(channelId) {
  const data = getData();
  for (let item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

function isMember(userId, channel_obj) {
  const data = getData();
  for (let item of channel_obj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}

function validateUserId(UserId) {
  const data = getData();
  for (let item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

function channelsTemplate() {
  const channel = {
    channelId:' ',
    name: ' ',
    isPublic: ' ',
    members: [],  
    messages: [], 
  }
  
  return channel;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };

