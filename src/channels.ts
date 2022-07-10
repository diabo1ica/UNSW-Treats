import { getData, setData, dataStr, channel } from './dataStore';

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
function channelsCreateV1(authUserId: number, name: string, isPublic: boolean) {
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }
  const data: dataStr = getData();
  const channels: channel = channelsTemplate();
  if (data.channelIdCounter === 0) {
    channels.channelId = 1;
    data.channelIdCounter++;
  } else {
    channels.channelId = data.channelIdCounter + 1;
    data.channelIdCounter++;
  }

  channels.name = name;
  channels.isPublic = isPublic;

  for (const item of data.users) {
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
  };
}
/*
Provide a list of channels and it's details that the authorised user is a part of.

Arguments:
    authUserId (integer) - Identification number of the user calling the
                          function

Return Value:
    Returns { channels } on authUserId is valid
*/

function channelsListV1(authUserId: number) {
  const data: dataStr = getData();
  const userchannels = [];

  for (const channel of data.channels) {
    if (channel.members.some(obj => obj.uId === authUserId)) {
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
function channelsListallV1(authUserId: number) {
  const data: dataStr = getData();
  if (validateUserId(authUserId) === false) {
    return {
      error: 'error'
    };
  }

  const allChannels = [];
  for (const item of data.channels) {
    allChannels.push({
      channelId: item.channelId,
      name: item.name,
    });
  }

  return {
    channels: allChannels // see interface for contents
  };
}
/*
Creates a channel template for new channels

Arguments:

Return Value:
    Returns {channel}
*/
function channelsTemplate() {
  const channel: channel = {
    channelId: 0,
    name: ' ',
    isPublic: true,
    members: [],
    messages: []
  };

  return channel;
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

export { channelsCreateV1, channelsListV1, channelsListallV1 };
