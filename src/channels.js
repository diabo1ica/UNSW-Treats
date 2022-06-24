import { getData, setData } from './dataStore.js'

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
  const data = getData();
  const channels = channelsTemplate();
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

function channelsListV1(authUserId) {
  return {
    channels: [] // see interface for contents
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
  const data = getData();
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
  const channel = {
    channelId:' ',
    name: ' ',
    isPublic: ' ',
    members: [],  
    messages: [] 
  }
  
  return channel;
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

export { channelsCreateV1, channelsListV1, channelsListallV1 };

