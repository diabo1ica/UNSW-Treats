import express, { application } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1, authLoginV1 } from './auth';
import { channelJoinV1, channelAddownerV1, messageEditV1, messageSendV1 } from './channel';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
import { userProfileSethandleV1, usersAllV1 } from './users';
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

app.post('/channel/join/v2', (req, res) => {
  const token: string = req.body.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const channelId: number = parseInt(req.body.channelId as string);
      const authUserId = decodeToken(token);
      res.json(channelJoinV1(authUserId, channelId));
    }
});

app.post('/channel/addowner/v1', (req, res) => {
  const token: string = req.body.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const channelId: number = parseInt(req.body.channelId as string);
      const userId: number = parseInt(req.body.uId as string);
      const authUserId = decodeToken(token);
      res.json(channelAddownerV1(authUserId, channelId, userId));
    }
});

app.put('/user/profile/sethandle/v1', (req, res) => {
  const token: string = req.body.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const handleStr: string = req.body.handleStr as string
      const authUserId = decodeToken(token);
      res.json(userProfileSethandleV1(authUserId, handleStr));
    }
});

app.get('/users/all/v1', (req, res, next) => {
  const token: string = req.query.token as string;
  if (!validToken(token)) {
    res.json({ error: 'error' });
  }  
  const authUserId = decodeToken(token);
  res.json(usersAllV1(authUserId))
});

app.post('/message/send/v1', (req, res) => {
  const token: string = req.body.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const channelId: number = parseInt(req.body.channelId as string);
      const message: string = req.body.uId as string;
      const authUserId = decodeToken(token);
      res.json(messageSendV1(authUserId, channelId, message));
    }
});

app.put('/message/edit/v1', (req, res) => {
  const token: string = req.body.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const messageId: number = parseInt(req.body.messageId as string);
      const authUserId = decodeToken(token);
      res.json(messageEditV1(authUserId, messageId));
    }
});

app.delete('/message/remove/v1', (req, res) => {
  const token: string = req.query.token as string;
    if (!validToken(token)) {
      res.json({ error: 'error' });
    }  
    else {
      const messageId: number = parseInt(req.query.messageId as string);
      const authUserId = decodeToken(token);
      res.json(messageEditV1(authUserId, messageId));
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

