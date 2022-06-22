import { getData } from './dataStore';

function channelDetailsV1(authUserId, channelId) {
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
  const data = getData();
  for (channel of data.channels) {
    for (users of data.users) {
      if (channelId !== channel.channelId) {
        break;
      }
      if (uId !== users.id) {
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
  }    
  return {error: 'error'};
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [],
    start: 0,
    end: -1,
  };
}


export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
