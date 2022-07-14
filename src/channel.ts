import { getData, setData, dataStr, channel, member, user, message, dm } from './dataStore';


function channelAddownerV1(authUserId: number, channelId: number, uId: number) {
  const data: dataStr = getData();
  const channelObj = getChannel(channelId);
  
  // checking if uId or channelId is not valid
  if (!validateUserId(uId) || channelObj === false) {
    return { error: 'error' };
  } 
  // check if uId is a member of channel
  if (!isMember(uId, channelObj)) {
    return { error: 'error' };
  }
  // check if authuser is not owner of channel
  for(const item of channelObj.members) {
    if (item.uId === authUserId) {
      if (item.channelPermsId !== 1) {
        return { error: 'error' };
      }
    }
  }
  // check if uId is already of owner of channel
  for(const item1 of channelObj.members) {
    if (item1.uId === uId) {
      if (item1.channelPermsId === 1) {
        return { error: 'error' };
      }
    }
  }

  // add owner
  for(const channel of data.channels) {
    for (const item2 of channel.members) {
      if (item2.uId === uId) {
        item2.channelPermsId = 1;
      }
    }
  }

  setData(data);
  return ({error: 'error'});

};

function messageSendV1(authUserId: number, channelId: number, message: string) {
  const data: dataStr = getData();
  const channelObj = getChannel(channelId);
  const curr_time: number = parseInt(new Date().toISOString());

  if (message.length > 1000 || message.length < 1) {
    return ({error: 'error'});
  }
  // check validity of channelId
  if (channelObj === false) {
    return ({error: 'error'});
  }
  // check if authuserId is member of channel
  if (isMember(authUserId, channelObj) === false) {
    return ({error: 'error'});
  }
  
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      data.messageIdCounter += 1;
      channel.messages.push({
        messageId: data.messageIdCounter,
        uId: authUserId,
        message: message,
        timeSent: curr_time,
      })
    }
  }
  setData(data);
  return ({ messageId: data.messageIdCounter});
}

function messageEditV1(authUserId: number, messageId: number, message?: string) {
  const data: dataStr = getData();

  if (message.length > 1000) {
    return ({error: 'error'});
  }
  // check if messageId is in channel, if not check in dm
  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // check if user is member in channel
      if (!isMember(authUserId, channel)) {
        return ({error: 'error'});
      }
      if (isOwner(authUserId, channel)) {
        return editMessagechannel(authUserId, messageId, message);
      }
      if (!isSender(authUserId, messageId, channel)) {
        return ({error: 'error'});
      }
    }
  }
  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      for (const item of dm.members) {
        if (item.uId === authUserId && item.dmPermsId === 1) {
          return editMessagechannel(authUserId, messageId, message);
        }
      }
      // check if user is in channel
      for (const item1 of dm.members) {
        if (item1.uId !== authUserId) {
          return ({error: 'error'});
        }
      }
      // check if is original sender
      for (const item2 of dm.messages) {
        if (item2.messageId === messageId && item2.uId !== authUserId) {
          return ({error: 'error'});
        }
      }
    }
  }

  
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

  for (const new_member of data.users) {
    if (new_member.userId === authUserId) {
      obj = new_member;
      break;
    }
  }

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (obj.globalPermsId === 1) {
        channel.members.push({
        uId: authUserId,
        channelPermsId: 2,
      });
      data.channels.push();
      return {};
      }
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


function getChannel(channelId: number) {
  const data: dataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

function isMember(userId: number, channel_obj: channel) {
  const data: dataStr = getData();
  for (const item of channel_obj.members) {
    if (userId === item.uId) {
      return true;
    }
  }
  return false;
}

function isOwner(userId: number, channel_obj: channel) {
  //if (dm_obj === undefined) {
    for (const item of channel_obj.members) {
      if (item.uId === userId && item.channelPermsId === 1) {
        return true;
      }
    }
 // }
  //if (channel_obj === undefined) {
   // for (const item of dm_obj.members) {
     // if (item.uId === userId && item.dmPermsId === 1) {
      //  return true;
    //  }
   // }
  //}
  return false;
}

function editMessagechannel(authUserId: number, messageId, message?: string) {
  const data: dataStr = getData();
  let index: number = 0;

  for (const channel of data.channels) {
    if (channel.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      if (message === undefined || message === '') {
        for (const item of channel.messages) {
          if (item.messageId === messageId) {
            channel.messages.splice(index, 1);
          }
          index++;
        }
      }
      else {
        for (const item of channel.messages) {
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

function editMessagedm(authUserId: number, messageId, message?: string) {
  const data: dataStr = getData();
  let index: number = 0;

  for (const dm of data.dms) {
    if (dm.messages.some(obj => obj.messageId === messageId)) {
      // delete message
      if (message === undefined || message === '') {
        for (const item of dm.messages) {
          if (item.messageId === messageId) {
            dm.messages.splice(index, 1);
          }
          index++;
        }
      }
      else {
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

function validateUserId(UserId: number) {
  const data: dataStr = getData();
  for (const item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

function isSender(userId: number, messageId: number, channel_obj: channel,) {
  for (const item of channel_obj.messages) {
    if (item.messageId === messageId) {
      if (item.uId === userId) {
        return true;
      }
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

export { channelJoinV1, channelAddownerV1, messageEditV1, messageSendV1 };

