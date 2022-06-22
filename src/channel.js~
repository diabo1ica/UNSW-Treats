import { getData, setData } from './dataStore.js'

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
  return {};
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [],
    start: 0,
    end: -1,
  };
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };

