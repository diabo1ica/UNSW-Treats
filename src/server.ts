import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { removeowner, channelMessagesV1, channelAddownerV1, channelJoinV1, channelInviteV1 } from './channel';
import { getData, setData, DataStr } from './dataStore';
import { clearV1, searchV1, uploadImage } from './other';
import * as jose from 'jose';
import { userProfileV1, userSetNameV1, userSetemailV1, userProfileSethandleV1, usersAllV1, adminRemove } from './users';
import { authRegisterV1, authLoginV1 } from './auth';
import cors from 'cors';
import { channelDetailsV1, messageEditV1, messageRemoveV1, messageSendV1, messageSendlaterv1 } from './channel';
import { messsageShareV1, messsageUnpinV1, messsageUnreactV1 } from './message';
import { adminUserPermChange } from './admin';
import { channelLeave } from './channel';
import { dmCreate, messageSendDm, dmDetails, dmMessages, dmLeave, dmList, dmRemove, sendLaterDm } from './dm';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';
import { startStandUp, activeStandUp, sendStandUp } from './standup';
import { messagePin, messageReact } from './message';

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
  }
  const data: DataStr = getData();
  const token: string = generateToken(id.authUserId);
  data.tokenArray.push(token);
  setData(data);
  const returnObj = {
    token: token,
    authUserId: id.authUserId
  };
  res.json(returnObj);
});

/*
Server route for channels/create/v3 calls and responds with output
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

app.post('/channels/create/v3', (req, res) => {
  const { name, isPublic } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot proceed Channels Create');
  } else {
    const authUserId = decodeToken(token);
    const detailsObj = channelsCreateV1(authUserId, name, isPublic);
    if (detailsObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid Channels name');
    }
    res.json(detailsObj);
  }
});

/*
Server route for user/profile/uploadphoto/v1 calls and responds with output
of uploadImage

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the authorised user's Id.
    ImgUrl (string)   - the URL of the image
    xStart (number)   - the start where image will be cropped in x-axis
    yStart (number)   - the start where image will be cropped in y-axis
    xEnd (number)     - the end where image will be cropped in x-axis
    yEnd (number)     - the end where image will be cropped in y-axis

Return Value:
    Returns {} on imgUrl not return HTTP status other than 200, the coordinate is within the dimension,
    xStart is less than xEnd, yStart is less than yEnd, and image uploaded as .jpg
    Returns {error400} on imgUrl return HTTP status other than 200
    Returns {error400} on the coordinate is not within the dimension
    Returns {error400} on xEnd is less than xStart, yEnd is less than yStart
    Returns {error400} on image not uploaded as .jpg

*/
app.post('/user/profile/uploadphoto/v1', (req, res) => {
  const token: string = req.header('token');
  const { imgUrl, xStart, xEnd, yStart, yEnd } = req.body;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot proceed Channels Create');
  } else {
    const authUserId = decodeToken(token);
    const detailsObj = uploadImage(authUserId, imgUrl, xStart, yStart, xEnd, yEnd);
    if (detailsObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid imgUrl HTTP status, or coordinated are not in the image dimension, or xEnd less than xStart, or yEnd less than yStart, or image uploaded is not .jpg');
    }
    res.json(detailsObj);
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

app.get('/channels/list/v3', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot proceed Channels List');
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
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot log out');
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
  const token: string = req.header('token');
  const chId: number = parseInt(req.query.channelId as string);

  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot access channel details');
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

app.post('/channel/invite/v3', (req, res) => {
  const { channelId, uId } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = channelInviteV1(authUserId, channelId, uId);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid channelId, Invalid Uid, Uid is already a member');
    }
    if (statusObj.error403) {
      throw HTTPError(AUTHORISATION_ERROR, 'Valid ChannelId but authUserId is not a member');
    }
    res.json(statusObj);
  }
});

/*
Given token of a user and channel id, removes the user from the channel's members array
Request :
    - token (string)      - The token of the user that is trying to leave the channel
    - channelId (number)  - The id of the channel
Response :
    - Returns {} if the removal is succesful
    - Throws Error 400 if the token does not exist in the dataStore
    - Throws Error 400 if channelId does not exist in the channels array
    - Throws Error 403 if the token points to a uid that doesn't exist in the channel's members array
*/
app.post('/channel/leave/v2', (req, res) => {
  const { channelId } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot leave channel');
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

app.get('/user/profile/v3', (req, res) => {
  const token: string = req.header('token');
  const uID: number = parseInt(req.query.uId as string);
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const statusObj = userProfileV1(uID);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid Uid');
    }
    res.json(statusObj);
  }
});

/*
Server route for search/v1 calls and responds with output
of searchV1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    queryStr          - String that need to be search in messages inside channels/Dms

Return Value:
    Returns {messages} on Valid/active token & valid queryStr
    Returns {error400} on Invalid QueryStr
*/

app.get('/search/v1', (req, res) => {
  const token: string = req.header('token');
  const queryStr: string = req.query.queryStr as string;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const statusObj = searchV1(queryStr);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid QueryStr');
    }
    res.json(statusObj);
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

app.post('/channel/removeowner/v2', (req, res) => {
  const { channelId, uId } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = removeowner(authUserId, channelId, uId);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid channelId, Invalid Uid, Uid is already a member');
    }
    if (statusObj.error403) {
      throw HTTPError(AUTHORISATION_ERROR, 'Valid ChannelId but authUserId is not a member');
    }
    res.json(statusObj);
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

app.put('/user/profile/setname/v2', (req, res) => {
  const { nameFirst, nameLast } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = userSetNameV1(authUserId, nameFirst, nameLast);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid nameFirst or nameLast');
    }
    res.json(statusObj);
  }
});

/*
Server route for user/stats/v1 calls and responds with output
of userStatsv1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.

Return Value:
    Returns { userStats } on Valid/active token
*/
/*
app.get('/user/stats/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = userStatsv1(authUserId);
    res.json(statusObj);
  }
});

app.get('/users/stats/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(INPUT_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = usersStatsv1(authUserId);
    res.json(statusObj);
  }
});
*/

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

app.put('/user/profile/setemail/v2', (req, res) => {
  const { email } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = userSetemailV1(authUserId, email);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid email');
    }
    res.json(statusObj);
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
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot access dm list');
  } else {
    res.json(dmList(decodeToken(token)));
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
  const token: string = req.header('token');
  const dmId = parseInt(req.query.dmId as string);
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot remove dm');
  } else {
    const removeStatus = dmRemove(decodeToken(token), dmId);
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

app.get('/channels/listall/v3', (req, res) => {
  const token = req.header('token');
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(channelsListallV1(decodeToken(token))); // respond to request with list of all channels
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

app.get('/channel/messages/v3', (req, res) => {
  const token = req.header('token');
  const channelId = JSON.parse(req.query.channelId as string);
  const start = JSON.parse(req.query.start as string);
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(channelMessagesV1(decodeToken(token), channelId, start)); // respond to request with list of message in channel
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

app.post('/dm/create/v2', (req, res) => {
  const token = req.header('token');
  const { uIds } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(dmCreate(decodeToken(token), uIds)); // respond to request with the new DM's id
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

app.get('/dm/details/v2', (req, res) => {
  const token = req.header('token');
  const dmId = JSON.parse(req.query.dmId as string);
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(dmDetails(decodeToken(token), dmId)); // respond to request with details of the DM
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

app.post('/dm/leave/v2', (req, res) => {
  const token = req.header('token');
  const { dmId } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(dmLeave(decodeToken(token), dmId)); // respond to request with empty object
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

app.post('/message/senddm/v2', (req, res) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(messageSendDm(decodeToken(token), dmId, message)); // respond to request with messageId
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

app.get('/dm/messages/v2', (req, res) => {
  const token = req.header('token');
  const dmId = JSON.parse(req.query.dmId as string);
  const start = JSON.parse(req.query.start as string);
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token'); // Throw error if token is not active
  res.json(dmMessages(decodeToken(token), dmId, start)); // respond to request with list of messages, start and end indexes
});

/*
Server route for message/sendlaterdm/v1, calls and responds with the output
of sendLaterDm

Arguments:
    token (string)        - a string pertaining to an active user session
                        decodes into the user's Id.
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

app.post('/message/sendlaterdm/v1', (req, res) => {
  const token = req.header('token');
  const { dmId, message, timeSent } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  res.json(sendLaterDm(decodeToken(token), dmId, message, timeSent));
});

/*
Server route for message/react/v1, calls and responds with the output
of messageReact

Arguments:
    token (string)        - a string pertaining to an active user session
                        decodes into the user's Id.
    messageId (number)     - Identification number of the message which will be reacted
    reactId (number)       - Identification number of the reaction

Return Value:
    Returns {} on valid/active token, messageId refer to valid message, valid reactId, the message
    has not contain a react with ID reactId from authUserId
    Returns {error400} on messageId does not refer to valid message
    Returns {error400} on invalid reactId
    Returns {error400} on the message contain a react with ID reactId from authUserId
*/

app.post('/message/react/v1', (req, res) => {
  const token = req.header('token');
  const { messageId, reactId } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  res.json(messageReact(decodeToken(token), messageId, reactId));
});

/*
Server route for standup/start/v1, calls and responds with the output
of startStandUp

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    channelId (number)  - Identification number of the channel which standUp will be started
    length  (number)    - the length of time of how long will standUp be start

Return Value:
    Returns {timeFinish} on valid/active token, channelId refers to valid channel,
    length is not negative, active standup is not yet running
    Returns {error400} on invalid channelId
    Returns {error400} on negative length
    Returns {error400} on active standup currently running
    Returns {error403} on valid channelId but authUserId is not a member of the channel
*/

app.post('/standup/start/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, length } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  res.json(startStandUp(decodeToken(token), channelId, length));
});
/*
For a given channel, return whether a standup is active in it, and what time the standup finishes.
Arguements:
    - token (string)      - Takes in a token as a header
    - channelId (number)  - Channel id of the channel where the standup activity is being checked
Return Value:
    - Returns an object containing the stand up's active status and time finish.
    - Throws Error 403 on invalid token
    - Throws Error 400 if channelId refers to an invalid channel
    - Throws Error 403 if user is not member of channel
*/
app.get('/standup/active/v1', (req, res) => {
  const token = req.header('token');
  const channelId = parseInt(req.query.channelId as string);
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  res.json(activeStandUp(decodeToken(token), channelId));
});

/*
For a given channel, if a standup is currently active in the channel, send a message to get buffered in the standup queue.
Arguements:
    - token (string)      - Takes in token as a header
    - channelId (number)  - Channel id of the channel where the standup is being held
    - message (string)    - Message string that will be passed to the standUp message space
Return value:
    - Returns {} on success
    - Throws Error 403 on invalid token
    - Throws Error 400 if channelId refers to an invalid channel
    - Throws Error 400 if message length is over 1000
    - Throws Error 400 if no active standup is available in the channel
    - Throws Error 403 if user is not member of channel
*/
app.post('/standup/send/v1', (req, res) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  if (message.length > 1000) throw HTTPError(INPUT_ERROR, 'Message too long');
  res.json(sendStandUp(decodeToken(token), channelId, message));
});

/*
Server route for message/pin/v1, calls and responds with the output
of messagePin

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    messageId (number)     - Identification number of the message which will be pinned

Return Value:
    RReturns {} on valid/active token, messageId refer to valid message, message is not yet pinned, messagedID refer to
    a valid message and authUserId have user permission
    Returns {error400} on messageId does not refer to valid message
    Returns {error400} on message already pinned
    Returns {error403} on messageId is valid but authUserId does not have user permission
*/

app.post('/message/pin/v1', (req, res) => {
  const token = req.header('token');
  const { messageId } = req.body;
  if (!validToken(token)) throw HTTPError(AUTHORISATION_ERROR, 'Invalid/Inactive Token');
  res.json(messagePin(decodeToken(token), messageId));
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
app.post('/channel/join/v3', (req, res) => {
  const { channelId } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
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

app.post('/channel/addowner/v2', (req, res) => {
  const token: string = req.header('token');
  const { channelId, uId } = req.body;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    res.json(channelAddownerV1(authUserId, channelId, uId));
  }
});

/*
Server route for user/profile/uploadphoto/v1

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    imgUrl (string)   - the url of the image that will be cropped and stored
    xStart (number)   - the coordinate of x-axis to start cropping
    xEnd (number)     - the coordinate of x-axis to end cropping
    yStart (number)   - the coordinate of y-axis to start cropping
    yEnd (number)     - the coordinate of y-axis to end cropping

Return Value:
    Returns {} when succesfull
    Return {error400} if imgUrl return HTTP status other than 200
    Return {error400} if xStart yStart xEnd yEnd is invalid
    Return {error400} if xEnd and yEnd is less than or equal to xStart and yStart
    Return {error400} if image uploaded is not .jpg
*/

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
app.put('/user/profile/sethandle/v2', (req, res) => {
  const token: string = req.header('token');
  const { handleStr } = req.body;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
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
app.get('/users/all/v2', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  }
  const authUserId = decodeToken(token);
  res.json(usersAllV1(authUserId));
});

/*
Server route for admin/user/remove/v1, calls and responds with the output
of adminRemove

Arguments:
    token (string)    - a string pertaining to an active user session
                        decodes into the user's Id.
    uId (number)      - id that wanted to be remove
Return Value:
    Returns { error400 } if uId is invalid or uId is the only global owner.
    Returns { error403 } if authUserId is not a global owner
    Returns {} if successfull.
*/

app.delete('/admin/user/remove/v1', (req, res) => {
  const token = req.header('token');
  const uId = parseInt(req.query.uId as string);
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const authUserId = decodeToken(token);
    const statusObj = adminRemove(authUserId, uId);
    if (statusObj.error400) {
      throw HTTPError(INPUT_ERROR, 'Invalid uId or uId is the only global owner');
    }
    if (statusObj.error403) {
      throw HTTPError(INPUT_ERROR, 'authUserId is not a global owner');
    }
    res.json(statusObj);
  }
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
app.post('/message/send/v2', (req, res) => {
  const token: string = req.header('token');
  const { channelId, message } = req.body;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
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

app.put('/message/edit/v2', (req, res) => {
  const token: string = req.header('token');
  const { messageId, message } = req.body;
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
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
app.delete('/message/remove/v2', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const messageId: number = parseInt(req.query.messageId as string);
    const authUserId = decodeToken(token);
    res.json(messageRemoveV1(authUserId, messageId));
  }
});

// changes user's globall permission
app.post('/admin/userpermission/change/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const { uId, permissionId } = req.body;
    const authUserId = decodeToken(token);
    res.json(adminUserPermChange(authUserId, uId, permissionId));
  }
});

// sends a message at certain time in future
app.post('/message/sendlater/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const { channelId, message, timeSent } = req.body;
    const authUserId = decodeToken(token);

    res.json(messageSendlaterv1(authUserId, channelId, message, timeSent));
  }
});

// unpins  a message
app.post('/message/unpin/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const { messageId } = req.body;
    const authUserId = decodeToken(token);

    res.json(messsageUnpinV1(authUserId, messageId));
  }
});

// unreact  a message
app.post('/message/unreact/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const { messageId, reactId } = req.body;
    const authUserId = decodeToken(token);

    res.json(messsageUnreactV1(authUserId, messageId, reactId));
  }
});

// share  a message
app.post('/message/share/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token');
  } else {
    const { ogMessageId, message, channelId, dmId } = req.body;
    const authUserId = decodeToken(token);
    res.json(messsageShareV1(authUserId, ogMessageId, message, channelId, dmId));
  }
});

/*
Given an email address, if the email address belongs to a registered user,
send them an email containing a secret password reset code
Arguements:
    - email (string)      - An email string of the user trying to request the reset
Return Values:
    - Returns {} once the request is made
    - Throws Error 403 if the token is invalid
*/
app.post('/auth/passwordreset/request/v1', (req, res) => {
  const { email } = req.body;
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot request');
  }
  // Close all user's session
  closeAllSession(token);

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '725d3c36d94453',
      pass: '93f811caba2d52'
    }
  });

  const data: DataStr = getData();
  const userObj = data.users.find(user => user.email === email);
  const code: string = generateResetCode(userObj.userId);
  if (userObj !== undefined) {
    const resetObj = {
      uId: userObj.userId,
      resetCode: code
    };
    data.resetArray.push(resetObj);
    setData(data);
  }

  const mailOptions = {
    from: '725d3c36d94453',
    to: email,
    subject: 'Treats Reset Password Code',
    text: code
  };
  transporter.sendMail(mailOptions);
  res.json({});
});

/*
Given a reset code for a user, set that user's new password to the password provided
Arguements:
    - resetCode (string)      - code string that validates the reset process
    - newPassword (string)    - the new password string
Return Values:
    - Returns {} once the reset is made
    - Throws Error 400 if the new password is less than 6 in length
    - Throws Error 400 if the received code is invalid
*/
app.post('/auth/passwordreset/reset/v1', (req, res) => {
  const { resetCode, newPassword } = req.body;
  if (newPassword.length < 6) {
    throw HTTPError(INPUT_ERROR, 'New password too short, cannot reset password');
  }
  const data: DataStr = getData();
  const resetObj = data.resetArray.find(obj => obj.resetCode === resetCode);
  // Ensure that the code received matches with the code stored in the user
  // Also ensures that the reset code stored in the user is not empty
  if (resetObj === undefined && resetCode !== '') {
    throw HTTPError(INPUT_ERROR, 'Invalid code, cannot reset password');
  }
  // Delete all valid reset code stored for the user
  const id: number = resetObj.uId;
  for (let i = 0; i < data.resetArray.length; i++) {
    if (data.resetArray[i].uId === id) {
      data.resetArray.splice(i, 1);
      setData(data);
      i--;
    }
  }
  res.json({});
});

/*
Outputs the user's most recent 20 notifications, ordered from most recent to least recent.
Arguements:
    - token (string)    - Token passed in through header
Return value:
    - Returns an object {
          channelId (number)            - the channel Id of the channel where the notif came from, if notif comes from dm then channelId is undefined
          dmId (number)                 - the dm Id of the channel where the notif came from, if notif comes from channel then dmId is undefined
          notificationMessage (string)  - the nitification message
      }
    - Throws Error 400 if the token is invalid
*/
app.get('/notifications/get/v1', (req, res) => {
  const token: string = req.header('token');
  if (!validToken(token)) {
    throw HTTPError(AUTHORISATION_ERROR, 'Invalid token, cannot request');
  }
  const data: DataStr = getData();
  const id: number = decodeToken(token);
  const user = data.users.find(obj => obj.userId === id);
  const length = user.notifications.length - 1;
  const returnArray = [];
  for (let i = 0; (i < 20 && length - i >= 0); i++) {
    returnArray.push(user.notifications[length - i]);
  }
  res.json(returnArray);
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
/*
const server = app.listen(PORT, HOST, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
*/
const server = app.listen(parseInt(process.env.PORT || config.port), process.env.IP, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${process.env.PORT || config.port}`);
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

// Generates a random string
// First 6 characters used in the string ranges from ASCII value 48 to 122
// The range of the ASCII value means that numbers, letters uppercase and lowercase and some symbols are used.
// the random string is then appended with the user's uId
function generateResetCode (uId: number) {
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += String.fromCharCode(Math.floor(Math.random() * 74) + 48);
  }
  return str + uId.toString();
}

// Invalidates all of the user's session by deleting all if the user's
// Currently stored token in the tokenArray
function closeAllSession(token: string) {
  const data: DataStr = getData();
  const uId: number = decodeToken(token);
  for (let i = 0; i < data.tokenArray.length; i++) {
    if (decodeToken(data.tokenArray[i]) === uId) {
      data.tokenArray.splice(i, 1);
      setData(data);
      i--;
    }
  }
}
