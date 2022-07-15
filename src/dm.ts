import { getData, setData, dataStr, dm, dmMember, message } from './dataStore';

/*
Creates a new DM and stores it in dataStore

Arguments:
    creatorId (number)    - Identification number of the user creating
                            the DM.
    uIds (array)    - array of uIds of users that are to be invited
                      to the DM

Return Value:
    Returns {dmId} on Valid/active token, uIds doesn't have duplicate uId
    and every uId is valid
    Returns {error: 'error'} on Invalid/Inactive token, Uids contains duplicate uId or
    invalid uId are found in uIds
*/

export function dmCreate(creatorId: number, uIds: number[]) {
  const data: dataStr = getData();
  if (!uIds.every((uId) => validateUserId(uId)) || isDuplicateUserId(uIds) === true) {
    throw new Error('error'); // check all error cases
  }

  const newDm: dm = dmTemplate(); // create the new DM object
  newDm.creatorId = creatorId; // assign the creator's Id to the creatorId of the DM
  newDm.dmId = generatedmId(); // assign a unique dmId

  uIds.forEach((uId) => {
    const newMember = dmMemberTemplate();
    newMember.dmPermsId = 2;
    newMember.uId = uId;
    newDm.members.push(newMember);
  }); // For each uId inside of uIds will be added to the members list with member permissions

  const creator = dmMemberTemplate();
  creator.dmPermsId = 1; // Give the creator DM owner permissions
  creator.uId = creatorId; // store creator's Id
  newDm.members.push(creator); // Push new creator into members of new DM
  const sortedArray: string[] = [];
  for (const item of data.users) {
    if (newDm.members.some((member) => member.uId === item.userId)) sortedArray.push(item.handleStr);
  } // Push the handles of all members into an array
  sortedArray.sort(); // Sort the array by alphabetical order
  for (const item of sortedArray) {
    if (sortedArray.indexOf(item) === sortedArray.length - 1) {
      newDm.name += item;
    } else {
      newDm.name += item + ', ';
    }
  } // Create the new DM's Name
  data.dms.push(newDm); // Add new DM to dataStore
  setData(data); // Save changes to runtime data and data.json
  return {
    dmId: newDm.dmId
  };
}

/*
Given the dmId dmMessages will return the 50 most recent messages relative
to the given start index.

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.
    start (number)    - The starting index of which the next 50 messages
                        will be returned from

Return Value:
    Returns {messages, start, end} on start + 50 is an index which contains
    a message
    Returns {messages, start, -1} on start + 50 is an index which does not
    contain a message.
    Returns {error: 'error} on start is empty or over 1000 characters, invalid
    DM, user is not a member of DM, start is greater than the total messages in
    DM, or invalid/inactive token
*/

export function dmMessages(authUserId: number, dmId: number, start: number) {
  const dmObj = getDm(dmId);
  if (dmObj === false || start > dmObj.messages.length || !isDmMember(authUserId, dmObj)) throw new Error('error'); // check for all errors
  let end: number;
  const messagesArray: message[] = [];
  if (start + 50 >= dmObj.messages.length) {
    end = -1;
  } else {
    end = start + 50;
  } // Determine whether there are more messages in the DM after the first 50 from start.
  for (const item of dmObj.messages.slice(start, start + 50)) {
    messagesArray.push(item);
  } // extract the 50 most recent messages relative to start from the DM

  return {
    messages: messagesArray,
    start: start,
    end: end,
  };
}

/*
Sends a timestamped message to the DM specified in dmId.

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.
    message (string)    - the message that the user is trying to send
                          to the DM

Return Value:
    Returns {messageId} on valid/active token, dmId refers to valid DM,
    message is not empty and is under 1001 characters, user is a member
    of the DM.
    Returns {error: 'error'} on dmId refers to invalid DM, message is empty,
    message is over 1000 characters, or user is not a member of the DM.
*/

export function messageSendDm(authUserId: number, dmId: number, message: string) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === false || message.length < 1 || message.length > 1000 || !isDmMember(authUserId, dmObj)) throw new Error('error'); // check for all errors
  const newMessage = messageTemplate();// generate a messageTemplate for the relevant information
  newMessage.messageId = generateMessageId(); // generate unique messageid
  newMessage.uId = authUserId;
  newMessage.message = message;
  newMessage.timeSent = Math.floor((new Date()).getTime() / 1000); // time stamp the message in seconds
  data.dms[data.dms.findIndex((dm) => dm.dmId === dmId)].messages.unshift(newMessage); // push the new message to the beginning of the DM's messages
  setData(data); // Save changes to runtime data and data.json
  return {
    messageId: newMessage.messageId
  };
}

/*
Returns the details of the DM specified in dmId, specifically the name
of the DM and it's members

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.

Return Value:
    Returns {name, members} on valid/active token
    Returns {error: 'error'} on invalid DM or user is not a member
    of the DM
*/

export function dmDetails(authUserId: number, dmId: number) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === false || isDmMember(authUserId, dmObj) === false) throw new Error('error'); // check for all errors
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
  } // extract the relevant information of each member of the DM into a new array
  return {
    name: dmObj.name,
    members: members,
  };
}

/*
Removes the user as member of the specified DM in dmId.

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.

Return Value:
    Returns {} on token is active/valid and user is in DM
    Returns {error: 'error'} on invalid DM or user is not a member
    of the DM
*/

export function dmLeave(authUserId: number, dmId: number) {
  const data: dataStr = getData();
  const dmObj = getDm(dmId);
  if (!validateUserId(authUserId)) {
    throw new Error('Invalid userId');
  } else if (dmObj === false) {
    throw new Error('Invalid DM');
  } else if (!isDmMember(authUserId, dmObj)) {
    throw new Error('User is not a member of the DM');
  } // check for all errors
  dmObj.members = JSON.parse(JSON.stringify(dmObj.members.filter((obj) => obj.uId !== authUserId))); // Redefines members to a list excluding authorised user
  setData(data); // Save changes to runtime data and data.json
  return {};
}

// creates a template for new DMs
const dmTemplate = (): dm => {
  return {
    members: [],
    messages: [],
    dmId: 0,
    creatorId: 0,
    name: '',
  };
};

// creates a template for new messages
const messageTemplate = (): message => {
  return {
    messageId: 0,
    uId: 0,
    message: '',
    timeSent: 0,
  };
};

// creates a template for new members in the DM
const dmMemberTemplate = (): dmMember => {
  return {
    uId: 0,
    dmPermsId: 0,
  };
};

// Validates the given userId is a registered user
const validateUserId = (UserId: number) => {
  const data: dataStr = getData();
  if (data.users.some((user) => user.userId === UserId)) return true;
  return false;
};

// Validates the given array doesn't have any duplicate uIds
const isDuplicateUserId = (userIds: number[]) => {
  for (const item of userIds) {
    if (userIds.filter((uId) => uId === item).length !== 1) {
      return true;
    }
  }
  return false;
};

// Validates the dmId refers to a registered DM
function getDm(dmId: number) {
  const data: dataStr = getData();
  for (const item of data.dms) {
    if (item.dmId === dmId) return item;
  }
  return false;
}

// Validates that the user is a member of the given DM
function isDmMember(uId: number, dmObj: dm) {
  if (dmObj.members.some((member) => member.uId === uId)) {
    return true;
  }
  return false;
}

// generates a unique message id
function generateMessageId() {
  let messageId: number;
  const data = getData();
  if (data.messageIdCounter === 0) messageId = 1;
  else messageId = data.messageIdCounter + 1;
  data.messageIdCounter++;
  setData(data);
  return messageId;
}

// generates a unique dmId
function generatedmId() {
  const data = getData();
  let dmId: number;
  if (data.dmIdCounter === 0) dmId = 1;
  else dmId = data.dmIdCounter + 1;
  data.dmIdCounter++;
  setData(data);
  return dmId;
}
