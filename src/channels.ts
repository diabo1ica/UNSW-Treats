import { getData, setData, dataStr, channel } from './dataStore'

/*
Create a channel with given name and whether it is public or private.

Arguments:
    authUserId (integer)  - author user id, the user that create the channel 
                            and a member of channel.
    name (string)         - the name of the channel.
    isPublic (boolean)    - true if it is public and false for private.
                           
Return Value:
    Returns {channelId: <number>} on valid authUserId and name
    Returns {error: 'error'} on name that is invalid (less than 1 or 
                             more than 20
*/
function channelsCreateV1(authUserId, name, isPublic) {
  if (name.length < 1 || name.length > 20) {
    return {error: 'error'};
  }
  const data: dataStr = getData();
  const channels: channel = channelsTemplate();
  if (data.channelIdCounter === 0) {
    channels.channelId = 1;
    data.channelIdCounter++;
  }
  else {
    channels.channelId = data.channelIdCounter + 1;
    data.channelIdCounter++;
  }
  
  channels.name = name;
  channels.isPublic = isPublic;
  
  for (let item of data.users) {
    if (item.userId === authUserId) {
      channels.members.push({
        uId: authUserId,
        email: item.email,
        nameFirst: item.nameFirst,
        nameLast: item.nameLast,
        handleStr: item.handleStr,
        channelPermsId: 1,
      });
    }
  }
  data.channels.push(channels);
  setData(data);
  return {
    channelId: channels.channelId,
  }
}
/*
Provide a list of channels and it's details that the authorised user is a part of.

Arguments:
    authUserId (integer) - Identification number of the user calling the 
                          function

Return Value:
    Returns { channels } on authUserId is valid
*/

function channelsListV1(authUserId) {
  const data: dataStr = getData();
  const userchannels = [];
  
  for (let channel of data.channels) {
    if(channel.members.some(obj => obj.uId === authUserId)) { 
      userchannels.push({
        channelId: channel.channelId,
        name: channel.name,
      });
    }
  }

  return {
    channels: userchannels
  };
}
/*
Finds all existing channels and lists them in an array including their details.

Arguments:
    authUserId (integer)    - Identification number of the user calling the 
                              function
    
Return Value:
    Returns { channels } on authUserId is valid
    Returns {error: 'error'} on authUserId is invalid 
*/
function channelsListallV1(authUserId) {
  const data: dataStr = getData();
  if (validateUserId(authUserId) === false) {
    return {
      error: 'error'
    }
  }
  
  const allChannels = []; 
  for (let item of data.channels) {
    allChannels.push({
      channelId: item.channelId,
      name: item.name,
    });
  }
  
  return {
    channels: allChannels // see interface for contents
  };
}

function channelsTemplate() {
  const channel: channel = {
    channelId: 0,
    name: ' ',
    isPublic: true,
    members: [],  
    messages: [] 
  }
  
  return channel;
}

function validateUserId(UserId) {
  const data: dataStr = getData();
  for (let item of data.users) {
    if (item.userId === UserId) {
      return true;
    }
  }
  return false;
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };