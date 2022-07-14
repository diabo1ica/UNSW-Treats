import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { getData, setData, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
import { dmCreate, messageSendDm, dmDetails } from './dm';

// Set up web app, use JSON
const app = express();

// Some magical token formulas from a npm library that spits out some whoop dee doo yeet magically exclusive token for each uid
// generateToken - takes in a number and turns it to a token of type string
// decodeToken   - takes in a token string and reverts it to its original number
const generateToken = (uId: number): string => new jose.UnsecuredJWT({ uId: uId }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
const decodeToken = (token: string): number => jose.UnsecuredJWT.decode(token).payload.uId as number;

app.use(express.json());

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

app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  } else {
    const authUserId = decodeToken(token);
    const channelId = channelsCreateV1(authUserId, name, isPublic);
    res.json({
      channelId: channelId.channelId,
    });
  }
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

app.post('/dm/create/v1', (req, res) => {
  try {
    const { token, uIds } = req.body;
    if (!validToken(token)) throw new Error('Invalid Token');
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
    if (!validToken(token)) throw new Error('Invalid Token');
    res.json(dmDetails(decodeToken(token), dmId));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.post('/message/senddm/v1', (req, res) => {
  try {
    const { token, dmId, message } = req.body;
    if (!validToken(token)) throw new Error('Invalid Token');
    res.json(messageSendDm(decodeToken(token), dmId, message));
  } catch (err) {
    res.json({ error: 'error' });
  }
});

app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

function validToken(token: string) {
  const data: dataStr = getData();
  for (const tokenObj of data.tokenArray) {
    if (token === tokenObj) return true;
  }
  return false;
}

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

function chDetailsV2(token: string, chId: number) {
  const userId = decodeToken(token);
  return channelDetailsV1(userId, chId);
}

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

function dmRemove(token: string, dmId: number) {
  const data: dataStr = getData();
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) {
      data.dms.splice(i, 1);
    }
  }
  setData(data);
  return {};
}
