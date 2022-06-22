import { getData } from './dataStore'

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
      channels.members[name] = item.name;
      channels.members.push({
        uId: authUserId,
        email: item.email,
        nameFirst: item.firstname,
        nameLast: item.lastname,
        handleStr:'',
        channelPermsId: 1,
      });
    }
  }
  data.channels.push(channels);
  return {
    channelId: channels.channelId,
  }
}

function channelsListV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
}

function channelsListallV1(authUserId) {
  return {
    channels: [] // see interface for contents
  };
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

export { channelsCreateV1, channelsListV1, channelsListallV1 };

