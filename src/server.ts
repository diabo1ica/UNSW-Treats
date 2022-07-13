import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
const generateToken = (uId: number):string => new jose.UnsecuredJWT({uId: uId}).encode();
const decodeToken = (token: string): number => jose.UnsecuredJWT.decode(token).payload.uId as number;

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
  for (const user of data.users) {
    if (id.authUserId === user.userId) {
      token = generateToken(id.authUserId);
      data.tokenArray.push(token);
    }
  }
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

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const chId = parseInt(req.query.channelId as string);
  const data: dataStr = getData();
  let userId = 0;
  for (const user of data.users) {
    if (user.some(obj => obj.userId === userId)) { // TODO
      userId = user.userId;
      break;
    }
  }
  res.json(channelDetailsV1(userId, chId));
});

app.get('/dm/list/v1', (req, res) => {
  const token = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }
  const data: dataStr = getData();
  let uId: number = decodeToken(token);
  const dmArray = [];
  for (const dm of data.dms) {
    if (dm.members.some(obj => obj.uId === uId)) { // TODO
      const dmObj = {
        dmId: dm.dmId, // TODO
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
      data.dms = data.dm.slice(0, i);
    }
  }
});

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
