import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { channelsCreateV1, channelsListV1 } from './channels';
import { authRegisterV1 } from './auth';
import { channelDetailsV1, channelInviteV1 } from './channel';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose';
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
  let token = '';
  for (const user of data.users) {
    if (id.authUserId === user.userId) {
      token = generateToken(id.authUserId);
      user.tokenArray.push(token);
    }
  }
  res.json({
    token: token,
    authUserId: id.authUserId
  });
});


app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  const data: dataStr = getData();
  for (const user of data.users) {
    for (const i in user.tokenArray) {
      if (token === user.tokenArray[parseInt(i)]) {
        user.tokenArray.slice(0, parseInt(i));
      }
    }
  }
  res.json({});
});

app.post('/channels/create/v2', (req, res) => {
  try {
    const { name, isPublic } = req.body;
    const token: string = req.query.token as string;
    const authUserId = decodeToken(token);
    const channelId = channelsCreateV1(authUserId, name, isPublic);
    res.json({
      channelId: channelId,
    }); 
  } catch (err) {
    res.json({ error:'error' });
  }
});

app.get('channels/list/v2', (req, res) => {
  try {
    const token = req.query.token as string;
    const authUserId = decodeToken(token);
    res.json(channelsListV1(authUserId));
  } catch (err) {
    res.json({ error:'error' }); 
  }
});

/*
app.post('channel/invite/v2', (req,res) => {
  try {
    const { channelId, uId } = req.body;
    const token = req.query.token as string;
    const authUserId = decodeToken(token);
    res.json(channelInviteV1(authUserId, channelId, uId));
  } catch (err) {
    res.json({ error:'error' }); 
  }
});
*/


app.delete('/dm/remove/v1', (req, res) => {

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

