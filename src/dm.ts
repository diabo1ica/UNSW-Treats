import { getData, setData, dataStr, dm, dmMember, message } from './dataStore';

export function dmCreate(creatorId: number, uIds: number[]) {
  const data: dataStr = getData();
  if (!uIds.every((uId) => validateUserId(uId)) || isDuplicateUserId(uIds) === true) {
    throw new Error('error');
  }

  const newDm: dm = dmTemplate();
  newDm.creatorId = creatorId;
  newDm.dmId = generatedmId();

  uIds.forEach((uId) => {
    const newMember = dmMemberTemplate();
    newMember.dmPermsId = 2;
    newMember.uId = uId;
    newDm.members.push(newMember);
  });

  const creator = dmMemberTemplate();
  creator.dmPermsId = 1;
  creator.uId = creatorId;
  newDm.members.push(creator);
  const sortedArray: string[] = [];
  for (const item of data.users) {
    if (newDm.members.some((member) => member.uId === item.userId)) sortedArray.push(item.handleStr);
  }
  sortedArray.sort();
  for (const item of sortedArray) {
    if (sortedArray.indexOf(item) === sortedArray.length - 1) {
      newDm.name += item;
    } else {
      newDm.name += item + ', ';
    }
  }
  data.dms.push(newDm);
  setData(data);
  return {
    dmId: newDm.dmId
  };
}

export function dmMessages(authUserId: number, dmId: number, start: number) {
  const dmObj = getDm(dmId);
  if (dmObj === false || start > dmObj.messages.length || isDmMember(authUserId, dmObj) === false) throw new Error('error');
  let end: number;
  const messagesArray: message[] = [];
  if (start + 50 >= dmObj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  }
  for (const item of dmObj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  }

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

export function messageSendDm(authUserId: number, dmId: number, message: string) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === false || message.length < 1 || message.length > 1000 || !isDmMember(authUserId, dmObj)) throw new Error('error');
  const newMessage = messageTemplate();
  newMessage.messageId = generateMessageId();
  newMessage.uId = authUserId;
  newMessage.message = message;
  newMessage.timeSent = Math.floor((new Date()).getTime() / 1000);
  data.dms[data.dms.findIndex((dm) => dm.dmId === dmId)].messages.unshift(newMessage);
  setData(data);
  return {
    messageId: newMessage.messageId
  };
}

export function dmDetails(authUserId: number, dmId: number) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === false || isDmMember(authUserId, dmObj) === false) throw new Error('error');
  const members = [];
  let member: any;
  for (const user of data.users) {
    if (dmObj.members.some((member) => member.uId === user.userId)) {
      member = JSON.parse(JSON.stringify(user));
      delete member.password;
      delete member.globalPermsId;
      delete member.tokenArray;
      member.uId = member.userId;
      delete member.userId;
      members.push(member);
    }
  }
  return {
    name: dmObj.name,
    members: members,
  };
}

export function dmLeave(authUserId: number, dmId: number) {
  const data: dataStr = getData();
  const dmObj = getDm(dmId);
  if (!validateUserId(authUserId)) {
    throw new Error('Invalid userId');
  } else if (dmObj === false) {
    throw new Error('Invalid DM');
  } else if (!isDmMember(authUserId, dmObj)) {
    throw new Error('User is not a member of the DM');
  }
  dmObj.members = JSON.parse(JSON.stringify(dmObj.members.filter((obj) => obj.uId !== authUserId)));
  setData(data);
  return {};
}

const dmTemplate = (): dm => {
  return {
    members: [],
    messages: [],
    dmId: 0,
    creatorId: 0,
    name: '',
  };
};

const messageTemplate = (): message => {
  return {
    messageId: 0,
    uId: 0,
    message: '',
    timeSent: 0,
  };
};

const dmMemberTemplate = (): dmMember => {
  return {
    uId: 0,
    dmPermsId: 0,
  };
};

const validateUserId = (UserId: number) => {
  const data: dataStr = getData();
  if (data.users.some((user) => user.userId === UserId)) return true;
  return false;
};

const isDuplicateUserId = (userIds: number[]) => {
  for (const item of userIds) {
    if (userIds.filter((uId) => uId === item).length !== 1) {
      return true;
    }
  }
  return false;
};

function getDm(dmId: number) {
  const data: dataStr = getData();
  for (const item of data.dms) {
    if (item.dmId === dmId) return item;
  }
  return false;
}

function isDmMember(uId: number, dmObj: dm) {
  if (dmObj.members.some((member) => member.uId === uId)) {
    return true;
  }
  return false;
}

function generateMessageId() {
  let messageId: number;
  const data = getData();
  if (data.messageIdCounter === 0) messageId = 1;
  else messageId = data.messageIdCounter + 1;
  data.messageIdCounter++;
  setData(data);
  return messageId;
}

function generatedmId() {
  const data = getData();
  let dmId: number;
  if (data.dmIdCounter === 0) dmId = 1;
  else dmId = data.dmIdCounter + 1;
  data.dmIdCounter++;
  setData(data);
  return dmId;
}
