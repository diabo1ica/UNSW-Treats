import { getData } from './dataStore';

function channelDetailsV1(authUserId, channelId) {
  if(!data.channels.some(obj => obj.channelId === channelId)
  || !data.channels.users.some(obj => obj.authUserId === authUserId)){
    return { error: 'error' }
  }

  return {
    name: 'secret candy crush team', 
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  /*const data = getData();
  for (channel of data.channels) {
    if (channelId !== channel.channelId) {
      break;
    }
    if (uId === channel.members.id) {
      break;
    }
    if (channelId === channel.channelId && authUserId !== channel.members.id) {
      break;
    }
    channelJoinV1(authUserId, channelId);
    return {};  
  }    
  
  for (users of data.users) {
    if (uId !== users.id) {
        break;
    }
  }
  return {error: 'error'};*/
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
