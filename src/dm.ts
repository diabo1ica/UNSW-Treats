import { getData, setData, DataStr, Dm, Message } from './dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { dmMemberTemplate, dmTemplate, isDmMember, generatedmId, generateMessageId, getDm, validateUserId, isDuplicateUserId, dmMessageTemplate, getCurrentTime, sortMessages, getDmMessages, isReacted } from './util';
import HTTPError from 'http-errors';
import { dmInviteNotif, tagNotifDm } from './notification';
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
    Returns {error400} on Invalid/Inactive token, Uids contains duplicate uId or
    invalid uId are found in uIds
*/

export function dmCreate(creatorId: number, uIds: number[]) {
  const data: DataStr = getData();
  if (!uIds.every((uId) => validateUserId(uId))) throw HTTPError(INPUT_ERROR, 'An invalid uId was given');
  if (isDuplicateUserId(uIds)) throw HTTPError(INPUT_ERROR, 'Duplicate uIds have been given');

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
  for (const id of uIds) {
    dmInviteNotif(creatorId, newDm.dmId, id);
  }
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
    Returns {error400} on invalid dmId that does not refer to a valid DM
    Returns {error400} on start that is greater than total number of messages in channel
    Returns {error403} on valid dmId but authUserId is not a member in DM
*/

export function dmMessages(authUserId: number, dmId: number, start: number) {
  const data = getData();
  const dmObj = getDm(dmId);
  sortMessages(data.messages);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  const dmMessagesArr: Message[] = JSON.parse(JSON.stringify(getDmMessages(dmId)));
  if (start > dmMessagesArr.length) throw HTTPError(INPUT_ERROR, 'Start is greater than message count');
  if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM'); // check for all errors
  for (const message of dmMessagesArr) {
    delete message.channelId;
    delete message.dmId;
    message.reacts.forEach(react => { react.isThisUserReacted = isReacted(authUserId, message, react.reactId); });
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
    Returns {error400} on invalid dmId that does not refer to a valid DM
    Returns {error400} on message length that is less than 1 or over 1000 characters
    Returns {error403} on valid dmId but authUserId is not a member in DM
*/

export function messageSendDm(authUserId: number, dmId: number, message: string) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  if (message.length < 1) throw HTTPError(INPUT_ERROR, 'Empty message');
  if (message.length > 1000) throw HTTPError(INPUT_ERROR, 'Message greater than 1000 characters');
  if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM'); // check for all errors
  const newMessage = dmMessageTemplate();// generate a messageTemplate for the relevant information
  newMessage.messageId = generateMessageId(); // generate unique messageid
  newMessage.uId = authUserId;
  newMessage.message = message;
  newMessage.timeSent = getCurrentTime(); // time stamp the message in seconds
  newMessage.dmId = dmId;
  data.messages.unshift(newMessage); // push the new message to the beginning of the DM's messages
  setData(data); // Save changes to runtime data and data.json
  tagNotifDm(authUserId, message, dmId);
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
    Returns {error400} on invalid dmId that does not refer to a valid DM
    Returns {error403} on valid dmId but authUserId is not a member in DM
*/

export function dmDetails(authUserId: number, dmId: number) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  if (isDmMember(authUserId, dmObj) === false) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the DM'); // check for all errors
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
    Returns {error400} on invalid dmId that does not refer to a valid DM
    Returns {error403} on valid dmId but authUserId is not a member in DM
*/

export function dmLeave(authUserId: number, dmId: number) {
  const data: DataStr = getData();
  const dmObj = getDm(dmId);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'User is not a member of the DM'); // check for all errors
  dmObj.members = JSON.parse(JSON.stringify(dmObj.members.filter((obj) => obj.uId !== authUserId))); // Redefines members to a list excluding authorised user
  setData(data); // Save changes to runtime data and data.json
  return {};
}

/*
Wrappper function for the /dm/list/v1 implementation
Takes in a token, decodes it to a uid then lists all dms with that uid
Argurments :
    - token (string)      - The token of the user that is trying to access the list
Return values :
    - Returns an array of objects where each object contains dmId and the name of the dm
    - Returns an empty object if the user is not part of any dms
*/
export function dmList(uId: number) {
  const data: DataStr = getData();
  const dmArray = [];
  for (const dm of data.dms) {
    if (dm.members.some(obj => obj.uId === uId)) {
      const dmObj = {
        dmId: dm.dmId,
        name: dm.name
      };
      dmArray.push(dmObj);
    }
  }
  return { dms: dmArray };
}

/*
Wrapper function for the /dm/remove/v1 implementation
Arguements :
    - token (string)      - A token of the user doing the removal
    - dmId (number)       - The id of the dm that will be removed
Return values :
    - Returns {} once removal is done
    - Returns { error400: 'error' } if the dmId does not exist in the dataStore
    - Returns { error403: 'error' } if the uid of the token is not the dm creator
    - Returns { error403: 'error  } if the uid is not in the dm members list
*/
export function dmRemove(id: number, dmId: number) {
  const data: DataStr = getData();
  // Find the dm in the dm array
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) {
      // Verify if token owner is the dm creator
      for (let j = 0; j < data.dms[i].members.length; j++) {
        if (data.dms[i].members[j].uId === id && data.dms[i].members[j].dmPermsId === 1) {
          data.dms.splice(i, 1);
          setData(data);
          return {};
        }
      }
      return { error403: 'error' };
    }
  }
  return { error400: 'error' };
}

/*
Send a message from authUserId to specified DM

Arguments:
    authUserId (number)    - Identification number of the user calling
                             the function
    dmId (number)          - Identification number of of dm
    message (string)       - The message that will be sent
    timeSent (number)      - The time when the message will be send in dm

Return Value:
    Returns { messageId } on valid/active token, dmID refer to valid DM,
    length of message is between 1 and 1000 character, timeSent is not time in past,
    and valid dmId while authUserId is a member of the DM
    Returns {error400} on dmId does not refer to valid DM
    Returns {error400} on message length is less than 1 or over 1000
    Returns {error400} on timeSent is time in the past
    Returns {error403} on valid dmId but authUserId is not a member of the DM
*/

export function sendLaterDm(authUserId: number, dmId: number, message: string, timeSent: number) {
  const data = getData();
  const dmObj = getDm(dmId);
  if (dmObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid DM');
  if (message.length < 1) throw HTTPError(INPUT_ERROR, 'Empty message');
  if (message.length > 1000) throw HTTPError(INPUT_ERROR, 'Message greater than 1000 characters');
  if (timeSent < getCurrentTime()) throw HTTPError(INPUT_ERROR, 'Cannot send message into the past!');
  if (!isDmMember(authUserId, dmObj)) throw HTTPError(AUTHORISATION_ERROR, 'Not a member of the DM');
  const newMessage = dmMessageTemplate();
  newMessage.messageId = generateMessageId();
  newMessage.timeSent = timeSent;
  newMessage.message = message;
  newMessage.uId = authUserId;
  newMessage.dmId = dmId;
  data.messages.unshift(newMessage);
  setData(data);
  tagNotifDm(authUserId, message, dmId);
  return {
    messageId: newMessage.messageId
  };
}
