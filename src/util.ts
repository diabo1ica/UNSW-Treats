import { getData, setData, Dm, Message, DmMember, DataStr, Channel } from './dataStore';
// creates a template for new DMs
export const dmTemplate = (): Dm => {
  return {
    members: [],
    messages: [],
    dmId: 0,
    creatorId: 0,
    name: '',
  };
};

// creates a template for new messages
export const messageTemplate = (): Message => {
  return {
    messageId: 0,
    uId: 0,
    message: '',
    timeSent: 0,
  };
};

// creates a template for new members in the DM
export const dmMemberTemplate = (): DmMember => {
  return {
    uId: 0,
    dmPermsId: 0,
  };
};

// Validates the given userId is a registered user
export const validateUserId = (UserId: number) => {
  const data: DataStr = getData();
  return data.users.some((user) => user.userId === UserId);
};

// Validates the given array doesn't have any duplicate uIds
export const isDuplicateUserId = (userIds: number[]) => {
  for (const item of userIds) {
    if (userIds.filter((uId) => uId === item).length !== 1) {
      return true;
    }
  }
  return false;
};

// Validates the dmId refers to a registered DM
export function getDm(dmId: number) {
  const data: DataStr = getData();
  for (const item of data.dms) {
    if (item.dmId === dmId) return item;
  }
  return false;
}

// Validates that the user is a member of the given DM
export function isDmMember(uId: number, dmObj: Dm) {
  return dmObj.members.some((member) => member.uId === uId);
}

// generates a unique message id
export function generateMessageId() {
  let messageId: number;
  const data = getData();
  if (data.messageIdCounter === 0) messageId = 1;
  else messageId = data.messageIdCounter + 1;
  data.messageIdCounter++;
  setData(data);
  return messageId;
}

// generates a unique dmId
export function generatedmId() {
  const data = getData();
  let dmId: number;
  if (data.dmIdCounter === 0) dmId = 1;
  else dmId = data.dmIdCounter + 1;
  data.dmIdCounter++;
  setData(data);
  return dmId;
}

// Validates the dmId refers to a registered DM
export function getChannel(channelId: number) {
  const data: DataStr = getData();
  for (const item of data.channels) {
    if (item.channelId === channelId) {
      return item;
    }
  }
  return false;
}

// Validates that the user is a member of the given channel
export function isMember(userId: number, channelObj: Channel) {
  return channelObj.members.some((member) => member.uId === userId);
}

export function getCurrentTime() {
  return Math.floor((new Date()).getTime() / 1000);
}
