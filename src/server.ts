import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { channelInviteV1, removeowner, channelMessagesV1, channelAddownerV1, channelJoinV1 } from './channel';
import { getData, setData, DataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
import { userProfileV1, userSetNameV1, userSetemailV1, userProfileSethandleV1, usersAllV1 } from './users';
import { authRegisterV1, authLoginV1 } from './auth';
import cors from 'cors';
import { channelDetailsV1, messageEditV1, messageRemoveV1, messageSendV1 } from './channel';
import { dmCreate, messageSendDm, dmDetails, dmMessages, dmLeave } from './dm';
import { INPUT_ERROR, AUTHORISATION_ERROR } from './tests/request';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';

// Set up web app, use JSON
const app = express();

// Some magical token formulas from a npm library that spits out some whoop dee doo yeet magically exclusive token for each uid
// generateToken - takes in a number and turns it to a token of type string
// decodeToken   - takes in a token string and reverts it to its original number
const generateToken = (uId: number): string => new jose.UnsecuredJWT({ uId: uId }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
const decodeToken = (token: string): number => jose.UnsecuredJWT.decode(token).payload.uId as number;
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// NOTE :
// Some of these request paths calls wrapper functions
// Documentations for the wrapper functions can be found on the bottom part of this file

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

/*
Takes in an email, password, nameFirst and nameLast and passes it to authRegisterV1
On success authRegisterV1 returns the id of the created user
The id is then passed on to wrapper function registerAuthV2
which returns an object containing the token and id of the user on success
Request :
    - email (string)      - an email string
    - password (string)   - a password string
    - nameFirst (string)  - First name of the user passed as a string
    - nameLast (string)   - Last name of the user passed as a string
Response :
    - Returns an object containing the token and id of the user on success
    - Throws Error 400 if authRegisterV1 returns an error
*/
app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const id = authRegisterV1(email, password, nameFirst, nameLast);
  if (id.error) {
    throw HTTPError(INPUT_ERROR, 'Invalid parameters, cannot register');
  } else {
    res.json(registerAuthV2(id.authUserId));
  }
});

/*
Server route for channels/create/v2 calls and responds with output
of channelsCreateV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the authorised user's Id.
    name (string)    - Name of the new channel
                            user is being invited to
    isPublic (boolean)    - determines whether the channel is Public or Private

Return Value:
    Returns {channelId} on Valid/active token & name is 1-20 characters
    Returns {error: 'error'} on invalid/inactive token | length of name is
    less than 1 or more than 20 characters
*/

app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelsCreateV1(authUserId, name, isPublic));
  }
});

/*
Server route for channels/list/v2 calls and responds with output
of channelsListV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the authorised user's Id.

Return Value:
    Returns {channels} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token
*/

app.get('/channels/list/v2', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelsListV1(authUserId));
  }
});

/*
Logs a user out by invalidating the user's token
the token is deleted from the dataStore
Request :
    - token (string)      - The token of the user that is trying to log out
Response :
    - Returns {} if the token is successfully removed
    - Throws Error 400 if the token does not exist in the dataStore
*/
app.post('/auth/logout/v2', (req, res) => {
  const { token } = req.body;
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token, cannot log out');
  }
  const data: DataStr = getData();
  for (let i = 0; i < data.tokenArray.length; i++) {
    if (token === data.tokenArray[i]) {
      data.tokenArray.splice(i, 1);
    }
  }
  setData(data);
  res.json({});
});

/*
Given a channel id, finds the channel in the dataStore and reveals the details of that channel
Request :
    - token (string)      - The token of the user trying to access the channel details
    - chId (number)       - The id of the channel
Response :
    - Returns an object containing the channel's name, isPublic value, owners and members
    - Throws Error 400 if the token does not exist in the dataStore
    - Throws Error 400 if the chId refers to a channel that does not exist in the dataStore
    - Throws Error 400 if the token refers to a uId that isn't a member of the channel
*/
app.get('/channel/details/v3', (req, res) => {
  const token: string = req.query.token as string;
  const chId: number = parseInt(req.query.channelId as string);
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token, cannot access channel details');
  } else {
    const userId = decodeToken(token);
    const detailsObj = channelDetailsV1(userId, chId);
    if (detailsObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid channel id, cannot acccess token');
    }
    if (detailsObj.error403) {
      throw HTTPError(AUTHORISATION_ERROR, 'Invalid uid, cannot acccess token');
    }
    res.json(detailsObj);
  }
});

/*
Server route for channel/invite/v2 calls and responds with output
of channelInviteV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)    - Identification number of the channel that
                            user is being invited to
    uId (number)    - Identification number of the user being invited

Return Value:
    Returns {} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token | uId refers to invalid
    user | channelId refers to invalid channel | uId refers to a user who is
    already a member of the channel | authorised user is not a member of the channel
*/

app.post('/channel/invite/v2', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelInviteV1(authUserId, channelId, uId));
  }
});

/*
Given token of a user and channel id, removes the user from the channel's members array
Request :
    - token (string)      - The token of the user that is trying to leave the channel
    - channelId (number)  - The id of the channel
Response :
    - Returns {} if the removal is succesful
    - Returns { error: 'error' } if the token does not exist in the dataStore
    - Returns { error: 'error  } if channelId does not exist in the channels array
    - Returns { error: 'error' } if the token points to a uid that doesn't exist in the channel's members array
*/
app.post('/channel/leave/v2', (req, res) => {
  const { token, channelId } = req.body;
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token, cannot leave channel');
  } else {
    const userId = decodeToken(token);
    const leaveStatus = channelLeave(userId, channelId);
    if (leaveStatus.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid channel id, cannot leave channel');
    }
    if (leaveStatus.error403) {
      throw HTTPError(AUTHORISATION_ERROR, 'Invalid uid, cannot leave channel');
    }
    res.json(leaveStatus);
  }
});

/*
Server route for user/profile/v2 calls and responds with output
of userProfileV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    uId (number)    - Identification number of the user being invited

Return Value:
    Returns {user} on Valid/active token & valid uId
    Returns {error: 'error'} on invalid/inactive token | uId does not
    refer to a valid user
*/

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

/*
Server route for channel/removeowner/v1 calls and responds with output
of removeowner

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)    - Identification number of the channel being
                            edited
    uId (number)    - Identification number of the owner whose permissions
                      are to be replaced with member permissions

Return Value:
    Returns {} on Valid/active token
    Returns {error: 'error'} on invalid/inactive token, invalid userId, uId
    refers to a user who is not an owner of the channel, uId refers to a user
    who is the only owner of the channel, authorised user does not have owner
    permissions
*/

app.post('/channel/removeowner/v1', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(removeowner(authUserId, channelId, uId));
  }
});

/*
Server route for user/profile/setname/v1 calls and responds with output
of userSetNameV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    nameFirst (string)    - First name the user wishes to switch to
    nameLast (string)    - Last name the user wishes to switch to

Return Value:
    Returns {} on Valid/active token & nameFirst and nameLast have 1-50 characters
    Returns {error: 'error'} on invalid/inactive token | length of nameFirst
    is not between 1 and 50 characters inclusive | length of nameLast is not
    between 1 and 50 characters inclusive
*/

app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userSetNameV1(authUserId, nameFirst, nameLast));
  }
});

/*
Server route for user/profile/setemail/v1 calls and responds with output
of userSetemailV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    email (string)    - email that user wishes to switch to

Return Value:
    Returns {} on Valid/active token & valid email & email is not being used
    Returns {error: 'error'} on invalid/inactive token | email entered
    is not a valid email | email address is being used by another user
*/

app.put('/user/profile/setemail/v1', (req, res) => {
  const { token, email } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userSetemailV1(authUserId, email));
  }
});

/*
Given a token of a user, finds all dms that the user is part of
Request :
    - token (String)      - The token of the user trying to access the dm list
Response :
    - Returns an array of objects where each object contains dmId and the name of the dm
    - Returns an empty object if the user is not part of any dms
    - Throws Error 400 if the token points to a uid that does not exist in the dataStore
*/
app.get('/dm/list/v2', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token, cannot access dm list');
  } else {
    res.json(dmList(token));
  }
});

/*
Given a token and dmId, finds and removes the dm with that id
Request :
    - token (string)      - the token of the user that is trying to remove the dm
    - dmId  (number)      - the id of the dm that will be removed
Response  :
    - Returns {} once removal is successful
    - Throws Error 400 if the dmId points to a dm that does not exist in the dataStore
    - Throws Error 403 if the token points to a uid that is not the uid of the dm creator
    - Throws Error 403 if the token points to a uid that is not in the dm members list
    - Throws Error 400 if the token points to a uid that does not exist in the dataStore
*/
app.delete('/dm/remove/v2', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token, cannot remove dm');
  } else {
    const removeStatus = dmRemove(token, dmId);
    if (removeStatus.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid channel id, cannot remove dm');
    }
    if (removeStatus.error403) {
      throw HTTPError(AUTHORISATION_ERROR, 'Invalid uid, cannot remove dm');
    }
    res.json(removeStatus);
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

app.post('/auth/login/v3', (req, res) => {
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

/*
Server route for channel/join/v2, calls and responds with the output
of channelJoinV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)    - Identification number of the channel where the
                        user joins.

Return Value:
    Returns {} when user joins the channel succesfully
    Returns {error: 'error'} on invalid channelId, user is alread a member
                        of channel, channel is private and user has no globalperm
*/
app.post('/channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelJoinV1(authUserId, channelId));
  }
});

/*
Server route for channel/addowner/v2, calls and responds with the output
of channelAddownerV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)    - Identification number of the channel where the
                        uId is going to be added as owner.
    uId (number)      - Identification of user that will be added as owner.

Return Value:
    Returns {} when uId is added as owner succesfully.
    Returns {error: 'error'} on invalid channelId, invalid uId, user is not a member
                        of channel, uId is already owner, authuser has no owner permission.
*/
app.post('/channel/addowner/v1', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelAddownerV1(authUserId, channelId, uId));
  }
});

/*
Server route for user/profile/sethandle/v1, calls and responds with the output
of userProfileSethandleV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    handleStr (string)    - Displayed name of user
Return Value:
    Returns {} when handleStr is changed succesfully
    Returns {error: 'error'} on incorrect handleStr length, contain non-alphanumeric characters,
                                the handleStr is occupied by another user.
*/
app.put('/user/profile/sethandle/v1', (req, res) => {
  const { token, handleStr } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(userProfileSethandleV1(authUserId, handleStr));
  }
});

/*
Server route for user/all/v1, calls and responds with the output
of userAllV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
Return Value:
    Returns { users } an array of all the users and their asscoiated detail on success.
*/
app.get('/users/all/v1', (req, res, next) => {
  const token: string = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }

  const authUserId = decodeToken(token);
  res.json(usersAllV1(authUserId));
});

/*
Server route for message/send/v1, calls and responds with the output
of messageSendV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)  - Identification of channel that the message
                        is sent.
    message (string)   - string of message that is sent.

Return Value:
    Returns { messageId } unique identification for the message on success
    Returns {error: 'error'} on invalid channelId, incorrect message length,
                            messageId being valid, but not included in channel that
                            usr is a part of.
*/
app.post('/message/send/v1', (req, res) => {
  const { token, channelId, message } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(messageSendV1(authUserId, channelId, message));
  }
});

/*
Server route for message/edit/v1, calls and responds with the output
of messageEditV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)  - Identification of channel that the message
                        is edited.
    message (string)   - string of message that is sent to be edited.

Return Value:
    Returns {} when message is edited succesfully
    Returns {error: 'error'} on incorrect message length, invalid messageId,
                              not the user who sent the message, no owner permission
                              to edit other's message.
*/
app.put('/message/edit/v1', (req, res) => {
  const { token, messageId, message } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(messageEditV1(authUserId, messageId, message));
  }
});

/*
Server route for message/remove/v1, calls and responds with the output
of messageRemoveV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    messageId (number)  - Identification of channel that the message
                        is removed.

Return Value:
    Returns {} when message is removed succesfully
    Returns {error: 'error'} on invalid messageId,  not the user who sent the
                              message, have no ownerpermsion to remove message.
*/
app.delete('/message/remove/v1', (req, res) => {
  const token: string = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const messageId: number = parseInt(req.query.messageId as string);
    const authUserId = decodeToken(token);
    res.json(messageRemoveV1(authUserId, messageId));
  }
});

// Calls the clearV1 function from ./other which resets the dataStore
// Always returns {}
app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
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
  const data: DataStr = getData();
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
  const data: DataStr = getData();
  const token: string = generateToken(id);
  data.tokenArray.push(token);
  setData(data);
  return {
    token: token,
    authUserId: id
  };
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
function dmList(token: string) {
  const data: DataStr = getData();
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
    - Returns { error400: 'error' } if the dmId does not exist in the dataStore
    - Returns { error403: 'error' } if the uid of the token is not the dm creator
    - Returns { error403: 'error  } if the uid is not in the dm members list
*/
function dmRemove(token: string, dmId: number) {
  const data: DataStr = getData();
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
      return { error403: 'error' };
    }
  }
  return { error400: 'error' };
}

/*
Wrapper function for the /channel/leave/v1 implementation
Arguements :
    - token (string)      - A token of the user that will leave the channel
    - chId (number)       - The id of the channel
Return values :
    - Returns {} once removal is done
    - Returns { error400: 'error' } if the token/uid does not exist in the dataStore
    - Returns { error400: 'error  } if chId does not exist in the channels array
    - Returns { error403: 'error' } if the token points to a uid that doesn't exist in the channel's members array
*/
function channelLeave(userId: number, chId: number) {
  const data: DataStr = getData();
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
      return { error403: 'error' };
    }
  }
  return { error400: 'error' };
}
