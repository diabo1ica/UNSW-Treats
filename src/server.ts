import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
const decodeToken = (token: string): number => {
  const decoded = jose.UnsecuredJWT.decode(token)
  return decoded.payload.uId as number;
}

// Set up web app, use JSON
const app = express();
const generateToken = (uId: number):string => new jose.UnsecuredJWT({ uId: uId }).setIssuedAt(Date.now()).setIssuer(JSON.stringify(Date.now())).encode();
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
  const data: dataStr = getData();
  let token: string = generateToken(id.authUserId);
  console.log('auth route :', id);
  data.tokenArray.push(token);
  setData(data);
  res.json({
    token: token,
    authUserId: id.authUserId
  });
});

app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const data: dataStr = getData();
  for (let i: number = 0; i < data.tokenArray.length; i++){
    if (token === data.tokenArray[i]){
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
  }
  else {
    const authUserId = decodeToken(token);
    const channelId = channelsCreateV1(authUserId, name, isPublic);
    res.json({
      channelId: channelId,
    }); 
  }
});

app.get('/channel/details/v2', (req, res) => {
  let token: string = req.query.token as string;
  const chId: number = parseInt(req.query.channelId as string);
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  else {
    res.json(chDetailsV2(token, chId));
  }
});

function chDetailsV2(token: string, chId: number) {
  let userId = decodeToken(token);
  return channelDetailsV1(userId, chId);
}

app.get('/dm/list/v1', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const data: dataStr = getData();
  let uId: number = decodeToken(token);
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
  res.json({ dms: dmArray });
});

app.delete('/dm/remove/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt(req.query.dmId as string);
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const data: dataStr = getData();
  for(let i = 0; i < data.dms.length; i++){
    if(data.dms[i].dmId === dmId) {
      data.dms = data.dms.slice(0, i);
    }
  }
  setData(data);
});

// Who wrote this ?
/*
app.delete('clear/v1', (req, res) => {
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
*/

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

app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

function validToken(token: string){
  let data: dataStr = getData();
  for (const tokenObj of data.tokenArray){
    if (token === tokenObj) return true;
  }
  return false;
}

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  getData(true);
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
