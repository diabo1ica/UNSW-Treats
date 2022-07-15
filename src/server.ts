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
import { dmCreate, messageSendDm, dmDetails, dmMessages } from './dm';

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

app.post('/auth/login/v2', (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = authLoginV1(email, password).authUserId;
    const token = generateToken(userId);
    const data = getData();
    data.tokenArray.push(token);
    setData(data);
    res.json({
      token: token,
      authUserId: userId
    });
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.get('/channels/listall/v2', (req, res) => {
  try {
    const token = req.query.token as string;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');

    res.json(channelsListallV1(decodeToken(token)));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.get('/channel/messages/v2', (req, res) => {
  try {
    const token = req.query.token as string;
    const channelId = JSON.parse(req.query.channelId as string);
    const start = JSON.parse(req.query.start as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');
    res.json(channelMessagesV1(decodeToken(token), channelId, start));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.post('/dm/create/v1', (req, res) => {
  try {
    const { token, uIds } = req.body;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');
    const dmId = dmCreate(decodeToken(token), uIds).dmId;
    res.json({ dmId: dmId });
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.get('/dm/details/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    const dmId = JSON.parse(req.query.dmId as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');
    res.json(dmDetails(decodeToken(token), dmId));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.post('/message/senddm/v1', (req, res) => {
  try {
    const { token, dmId, message } = req.body;
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');
    res.json(messageSendDm(decodeToken(token), dmId, message));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.get('/dm/messages/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    const dmId = JSON.parse(req.query.dmId as string);
    const start = JSON.parse(req.query.start as string);
    if (!validToken(token)) throw new Error('Invalid/Inactive Token');
    res.json(dmMessages(decodeToken(token), dmId, start));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

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
