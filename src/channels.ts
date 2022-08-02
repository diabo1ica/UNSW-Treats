import { getData, setData, DataStr, Channel } from './dataStore';
import { validateUserId } from './util';

/*
Create a channel with given name and whether it is public or private.

Arguments:

    token (string)        - a specific string point to the user that create the channel

    authUserId (integer)  - author user id, the user that create the channel

                            and a member of channel.
    name (string)         - the name of the channel.
    isPublic (boolean)    - true if it is public and false for private.

Return Value:
    Returns {channelId: <number>} on valid authUserId and name
    Returns {error: 'error'} on name that is invalid (less than 1 or
                             more than 20
*/
export function channelsCreateV1(authUserId: number, name: string, isPublic: boolean) {
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  } // validate channel name is between 1-20 characters inclusive
  const data: DataStr = getData();
  const channels: Channel = channelsTemplate();
  if (data.channelIdCounter === 0) {
    channels.channelId = 1;
    data.channelIdCounter++;
  } else {
    channels.channelId = data.channelIdCounter + 1;
    data.channelIdCounter++;
  } // generate the unique channelId

  channels.name = name;
  channels.isPublic = isPublic;

  for (const item of data.users) {
    if (item.userId === authUserId) {
      channels.members.push({
        uId: authUserId,
        channelPermsId: 1,
      });
    }
  } // list the channel creator as an owner of the channel
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

export function channelsListV1(authUserId: number) {
  const data: DataStr = getData();
  const allChannels: any[] = [];

  for (const channel of data.channels) {
    if (channel.members.some(obj => obj.uId === authUserId)) {
      allChannels.push({
        channelId: channel.channelId,
        name: channel.name,
      });
    }
  } // pushes all the channels that the user is a member of into a new array

  return {
    channels: allChannels
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
export function channelsListallV1(authUserId: number) {
  const data: DataStr = getData();
  if (validateUserId(authUserId) === false) {
    throw new Error('Invalid authUserId');
  } // check userId is valid

  const allChannels: any[] = [];
  for (const item of data.channels) {
    allChannels.push({
      channelId: item.channelId,
      name: item.name,
    });
  } // put all relevant information of all channels into a new array

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
  const channel: Channel = {
    channelId: 0,
    name: ' ',
    isPublic: true,
    members: [],
    standUp: {
      timeFinish: undefined,
      messageId: 0,
    }
  };

  return channel;
}
