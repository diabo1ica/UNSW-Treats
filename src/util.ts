import { getData, setData, Dm, Message, DmMember, DataStr, Channel } from './dataStore';
// creates a template for new DMs
export const dmTemplate = (): Dm => {
  return {
    members: [],
    dmId: 0,
    creatorId: 0,
    name: '',
  };
};

// creates a template for new messages
export const dmMessageTemplate = (): Message => {
  return {
    messageId: 0,
    uId: 0,
    message: '',
    timeSent: 0,
    isPinned: false,
    reacts: [],
    dmId: 0,
    channelId: undefined,
  };
};

export const channelMessageTemplate = (): Message => {
  return {
    messageId: 0,
    uId: 0,
    message: '',
    timeSent: 0,
    isPinned: false,
    reacts: [],
    channelId: 0,
    dmId: undefined,
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
  return data.dms.find(dm => dm.dmId === dmId);
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
  return data.channels.find(channel => channel.channelId === channelId);
}

// Validates that the user is a member of the given channel
export function isMember(userId: number, channelObj: Channel) {
  return channelObj.members.some((member) => member.uId === userId);
}

export function getCurrentTime() {
  return Math.floor((new Date()).getTime() / 1000);
}

export function getMessage(messageId: number) {
  const data: DataStr = getData();
  return data.messages.find(message => message.messageId === messageId);
}

export function getDmMessages(dmId: number): Message[] {
  const data = getData();
  return data.messages.filter(message => message.dmId === dmId && isMessageSent(message));
}

export function getChannelMessages(channelid: number) {
  const data = getData();
  return data.messages.filter(message => message.channelId === channelid && isMessageSent(message));
}

export function sortMessages(messages: Message[]) {
  messages.sort((message1, message2) => message2.timeSent - message1.timeSent);
}

export function isMessageSent(message: Message) {
  return message.timeSent <= getCurrentTime();
}

export function getDmPerms(userId: number, dm: Dm) {
  return dm.members.find(member => member.uId === userId).dmPermsId;
}

export function getChannelPerms (userId: number, channel: Channel) {
  return channel.members.find(member => member.uId === userId).channelPermsId;
}

export function getReact(message: Message, reactId: number) {
  return message.reacts.find(react => react.reactId === reactId);
}

export function isReacted(userId: number, message: Message, reactId: number) {
  const react = getReact(message, reactId);
  if (react === undefined) return false;
  if (react.uIds.some(uId => uId === userId)) return true;
  else return false;
}

export const OWNER = 1;
export const MEMBER = 2;

// check if owner permission in channel
export function isChannelOwner(userId: number, channelObj: Channel) {
  for (const item of channelObj.members) {
    if (item.uId === userId) {
      if (item.channelPermsId === 1) {
        return true;
      }
    }
  }
  return false;
}

// check if owner permission in dm
export function isDmOwner(userId: number, dmObj: Dm) {
  for (const item of dmObj.members) {
    if (item.uId === userId) {
      if (item.dmPermsId === 1) {
        return true;
      }
    }
  }
  return false;
}

// check if user is sent the message
export function isSender(userId: number, messageId: number) {
  const data: DataStr = getData();
  for (const item of data.messages) {
    if (item.messageId === messageId) {
      if (item.uId === userId) {
        return true;
      }
    }
  }
  return false;
}

export function getUser(userId: number) {
  const data: DataStr = getData();
  return data.users.find(user => user.userId === userId);
}

export function getGlobalPerms(authUserId: number) {
  const data = getData();
  return data.users.find(user => user.userId === authUserId).globalPermsId;
}
