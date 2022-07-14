import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelInviteV1, removeowner } from './channel';
import { getData, setData, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
import { userProfileV1, userSetNameV1, userSetemailV1 } from './users';
const decodeToken = (token: string): number => jose.UnsecuredJWT.decode(token).payload.uId as number;

// Set up web app, use JSON
const app = express();
const generateToken = (uId: number):string => new jose.UnsecuredJWT({ uId: uId }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

function validToken(token: string) {
  const data: dataStr = getData();
  for (const tokenObj of data.tokenArray) {
    if (token === tokenObj) return true;
  }
  return false;
}

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
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const userId = authRegisterV1(email, password, nameFirst, nameLast).authUserId;
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

app.post('/channel/invite/v2', (req, res) => {
  const { token, channelId, uId } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    res.json(channelInviteV1(authUserId, channelId, uId));
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

app.delete('clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
