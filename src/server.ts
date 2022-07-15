import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { channelInviteV1, removeowner, channelMessagesV1 } from './channel';
import { getData, setData, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
import { userProfileV1, userSetNameV1, userSetemailV1 } from './users';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { dmCreate, messageSendDm, dmDetails, dmMessages, dmLeave } from './dm';

// Set up web app, use JSON
const app = express();

// Some magical token formulas from a npm library that spits out some whoop dee doo yeet magically exclusive token for each uid
// generateToken - takes in a number and turns it to a token of type string
// decodeToken   - takes in a token string and reverts it to its original number
const generateToken = (uId: number): string => new jose.UnsecuredJWT({ uId: uId }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
const decodeToken = (token: string): number => jose.UnsecuredJWT.decode(token).payload.uId as number;
app.use(express.json());
// for logging errors
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v2', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const id = authRegisterV1(email, password, nameFirst, nameLast);
  if (id.error) {
    res.json({ error: 'error' });
  } else {
    res.json(registerAuthV2(id.authUserId));
  }
});

app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelsCreateV1(authUserId, name, isPublic));
  }
});

app.get('/channels/list/v2', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelsListV1(authUserId));
  }
});

app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const data: dataStr = getData();
  for (let i = 0; i < data.tokenArray.length; i++) {
    if (token === data.tokenArray[i]) {
      data.tokenArray = data.tokenArray.slice(0, i);
    }
  }
  setData(data);
  res.json({});
});

app.get('/channel/details/v2', (req, res) => {
  const token: string = req.query.token as string;
  const chId: number = parseInt(req.query.channelId as string);
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    res.json(chDetailsV2(token, chId));
  }
});

app.post('/channel/invite/v2', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelInviteV1(authUserId, channelId, uId));
  }
});

app.post('/channel/leave/v1', (req, res) => {
  const { token, channelId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const userId = decodeToken(token);
    res.json(channelLeave(userId, channelId));
  }
});

app.get('/user/profile/v2', (req, res) => {
  const token = req.query.token as string;
  const uID: number = parseInt(req.query.uId as string);
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userProfileV1(authUserId, uID));
  }
});

app.post('/channel/removeowner/v1', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(removeowner(authUserId, channelId, uId));
  }
});

app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userSetNameV1(authUserId, nameFirst, nameLast));
  }
});

app.put('/user/profile/setemail/v1', (req, res) => {
  const { token, email } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userSetemailV1(authUserId, email));
  }
});

app.get('/dm/list/v1', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    res.json(dmList(token));
  }
});

app.delete('/dm/remove/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    res.json(dmRemove(token, dmId));
  }
});

/*
Server route for auth/login/v2, calls authLoginV1
and logs in the user provided the email and password
are correct.

Arguments:
    email (string)    - email of the user. 
    password (string)    - password linked to email of user.

Return Value:
    Returns {token, authUserId} on correct email and password
    Returns {error: 'error} on invalid email and/or password 
*/

app.post('/auth/login/v2', (req, res) => {
  try {
    const { email, password } = req.body; // load relevant request information
    const userId = authLoginV1(email, password).authUserId; // Login the user
    const token = generateToken(userId); // Generate a new active token for the user
    const data = getData(); // load the datastore
    data.tokenArray.push(token); // Add the new active token to the datastore
    setData(data); // save changes
    res.json({
      token: token,
      authUserId: userId
    }); // responds to request with the desired information
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route for channels/list/all/v2, Validates token is an 
an active user session. Decodes token to get userId and calls
channelsListallV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.

Return Value:
    Returns { channels } on token is valid/active
    Returns {error: 'error'} on token is invalid/inactive
*/

app.get('/channels/listall/v2', (req, res) => {
  try {
    const token = req.query.token as string; 
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(channelsListallV1(decodeToken(token))); // respond to request with list of all channels
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route for channel/messages/v2, calls and responds with the ouput
of channelMessagesV1 

Arguments:
    token (integer)   - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (integer)    - Identification number of the channel whose messages
                             are to be viewed.
    start (integer)        - The starting index of which the user wants to start
                             looking at the messages from.

Return Value:
    Returns {messages, start, end} on correct input
    Returns {error: 'error'} on token is invalid/inactive
    Returns {error: 'error'} on start is greater than the total amount of
    messages
    Returns {error: 'error'} on channelId refers to an invalid channel
    Returns {error: 'error'} on channelId is valid but user is not a
    member of the channel
*/

app.get('/channel/messages/v2', (req, res) => {
  try {
    const token = req.query.token as string; 
    const channelId = JSON.parse(req.query.channelId as string);
    const start = JSON.parse(req.query.start as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(channelMessagesV1(decodeToken(token), channelId, start)); // respond to request with list of message in channel
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route for dm/create/v1, calls and responds with the output
of dmCreate

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    uIds (array)    - array of uIds of users that are to be invited
                      to the DM

Return Value:
    Returns {dmId} on Valid/active token, uIds doesn't have duplicate uId
    and every uId is valid
    Returns {error: 'error'} on Invalid/Inactive token, Uids contains duplicate uId or
    invalid uId are found in uIds
*/

app.post('/dm/create/v1', (req, res) => {
  try {
    const { token, uIds } = req.body;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(dmCreate(decodeToken(token), uIds)); // respond to request with the new DM's id
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route for dm/details/v1, calls and responds with the output
of dmDetails

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.

Return Value:
    Returns {name, members} on valid/active token
    Returns {error: 'error'} on invalid DM or user is not a member
    of the DM
*/

app.get('/dm/details/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    const dmId = JSON.parse(req.query.dmId as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(dmDetails(decodeToken(token), dmId)); // respond to request with details of the DM
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route for dm/leave/v1, calls and responds with the output
of dmLeave

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    dmId (number)    - Identification number of the DM whose messages
                       are to be viewed.

Return Value:
    Returns {} on token is active/valid and user is in DM
    Returns {error: 'error'} on invalid DM or user is not a member
    of the DM
*/

app.post('/dm/leave/v1', (req, res) => {
  try {
    const { token, dmId } = req.body;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(dmLeave(decodeToken(token), dmId)); // respond to request with empty object
  } catch (err) {
    console.log(err);
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

/*
Server route message/senddm/v1, calls and responds with the output
of messageSendDm

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
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

app.post('/message/senddm/v1', (req, res) => {
  try {
    const { token, dmId, message } = req.body;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(messageSendDm(decodeToken(token), dmId, message)); // respond to request with messageId
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});
/*
Server route for dm/messages/v1, calls and responds with the output
of dmMessages

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
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

app.get('/dm/messages/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    const dmId = JSON.parse(req.query.dmId as string);
    const start = JSON.parse(req.query.start as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token'); // Throw error if token is not active
    res.json(dmMessages(decodeToken(token), dmId, start)); // respond to request with list of messages, start and end indexes
  } catch (err) {
    res.json({ error: 'error' }); // responds to request with error if any errors are thrown
  }
});

//clear runtime data and data.json
app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// start server
app.listen(PORT, HOST, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

/*
Checks if the token received is a valid token or not by
performing a loop on the tokenArray stored in the dataStore
Arguements :
    - token (string)      - The token that will be checked
Return values :
    - Returns true if the token is found on the array
    - Returns false if the token is not found on the array
*/
function validToken(token: string) {
  const data: dataStr = getData();
  for (const tokenObj of data.tokenArray) {
    if (token === tokenObj) return true;
  }
  return false;
}

/*
Wrapper function for the /auth/register/v2 implementation
Takes in an id, creates a token out of the id and save to to the dataStore
Arguements :
    - id (number)       - The id of the user
Return values :
    - Returns an object containing the user's id and token
*/
function registerAuthV2(id: number) {
  const data: dataStr = getData();
  const token: string = generateToken(id);
  data.tokenArray.push(token);
  setData(data);
  return {
    token: token,
    authUserId: id
  };
}

/*
Wrapper function for the /channel/details/v2 implementation
Calls and returns channelDetailsV1 from './channel'
Arguements :
    - token (string)      - The token of the user that is trying to access the channel details
    - chId (number)       - The channel id of the channel to be inspected
Return values :
    - Returns the values that will be returned by channelDetailsV1
*/
function chDetailsV2(token: string, chId: number) {
  const userId = decodeToken(token);
  return channelDetailsV1(userId, chId);
}

/*
Wrappper function for the /dm/list/v1 implementation
Takes in a token, decodes it to a uid then lists all dms with that uid
Argurments :
    - token (string)      - The token of the user that is trying to access the list
Return values :
    - Returns an array of objects where each object contains dmId and the name of the dm
*/
function dmList(token: string) {
  const data: dataStr = getData();
  const uId: number = decodeToken(token);
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
    - Returns { error: 'error' } if the dmId does not exist in the dataStore
    - Returns { error: 'error' } if the uid of the token is not the dm creator
    - Returns { error: 'error  } if the uid is not in the dm members list
*/
function dmRemove(token: string, dmId: number) {
  const data: dataStr = getData();
  // Find the dm in the dm array
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) {
      const id: number = decodeToken(token);
      // Verify if token owner is the dm creator
      for (let j = 0; j < data.dms[i].members.length; j++) {
        if (data.dms[i].members[j].uId === id && data.dms[i].members[j].dmPermsId === 1) {
          data.dms.splice(i, 1);
          setData(data);
          return {};
        }
      }
      return { error: 'error' };
    }
  }
  return { error: 'error' };
}

/*
Wrapper function for the /channel/leave/v1 implementation
Arguements :
    - token (string)      - A token of the user that will leave the channel
    - chId (number)       - The id of the channel
Return values :
    - Returns {} once removal is done
    - Returns { error: 'error' } if the token/uid does not exist in the dataStore
    - Returns { error: 'error  } if chId does not exist in the channels array
    - Returns { error: 'error' } if the token points to a uid that doesn't exist in the channel's members array
*/
function channelLeave(userId: number, chId: number) {
  const data: dataStr = getData();
  // Find channel in channel array
  for (const channel of data.channels) {
    if (channel.channelId === chId) {
      // Find userId in channel's member array
      for (let i = 0; i < channel.members.length; i++) {
        if (channel.members[i].uId === userId) {
          channel.members.splice(i, 1);
          setData(data);
          return {};
        }
      }
      return { error: 'error' };
    }
  }
  return { error: 'error' };
}
