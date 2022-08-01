import { getData, setData, DataStr, Dm, Message } from './dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { dmMemberTemplate, dmTemplate, isDmMember, generatedmId, generateMessageId, getDm, validateUserId, isDuplicateUserId, dmMessageTemplate, getCurrentTime, sortMessages, getDmMessages, isReacted } from './util';
import HTTPError from 'http-errors';
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
  const data: DataStr = getData();
  if (!uIds.every((uId) => validateUserId(uId)) || isDuplicateUserId(uIds) === true) {
    throw new Error('error'); // check all error cases
  }

  const newDm: Dm = dmTemplate(); // create the new DM object
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
  const data = getData();
  const dmObj = getDm(dmId);
  sortMessages(data.messages);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  const dmMessagesArr: Message[] = JSON.parse(JSON.stringify(getDmMessages(dmId)));
  if (start > dmMessagesArr.length) throw HTTPError(INPUT_ERROR, 'Start is greater than message count');
  if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM'); // check for all errors
  for (let message of dmMessagesArr) {
    delete message.channelId;
    delete message.dmId;
    message.reacts.forEach(react => {react.isThisUserReacted = isReacted(authUserId, message, react.reactId)});
  }
  let end: number;
  if (start + 50 >= dmMessagesArr.length) end = -1;
  else end = start + 50; // Determine whether there are more messages in the DM after the first 50 from start.
  setData(data);
  return {
    messages: dmMessagesArr.slice(start, start + 50), // extract the 50 most recent messages relative to start from the DM
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
  newMessage.timeSent = getCurrentTime(); // time stamp the message in seconds
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
  const data: DataStr = getData();
  const dmObj = getDm(dmId);
  if (dmObj === false) {
    throw new Error('Invalid DM');
  } else if (!isDmMember(authUserId, dmObj)) {
    throw new Error('User is not a member of the DM');
  } // check for all errors
  dmObj.members = JSON.parse(JSON.stringify(dmObj.members.filter((obj) => obj.uId !== authUserId))); // Redefines members to a list excluding authorised user
  setData(data); // Save changes to runtime data and data.json
  return {};
}
