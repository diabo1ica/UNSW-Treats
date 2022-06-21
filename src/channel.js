function channelDetailsV1(authUserId, channelId) {
/*
  TODO:
  if(!data.channels.some(obj => obj.channelId === channelId)
  || !data.channels.users.some(obj => obj.authUserId === authUserId)){
    return { error: 'error' }
  }
*/
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

