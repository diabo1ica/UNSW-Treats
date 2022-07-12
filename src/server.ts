import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import { authRegisterV1 } from './auth';
import { channelDetailsV1 } from './channel';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
import * as jose from 'jose'

// Set up web app, use JSON
const app = express();
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
  let token: string = '';
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

app.get('/channel/details/v2', (req, res) => {
  const token = req.query.token as string;
  const chId = parseInt(req.query.channelId as string);
  const data: dataStr = getData();
  let userId = 0;
  for (const user of data.users) {
    if (user.some(obj => obj.tokenArray === token)) { // TODO
      userId = user.userId;
      break;
    }
  }
  res.json(channelDetailsV1(userId, chId));
});

app.get('/dm/list/v1', (req, res) => {
  const token = req.query.token as string;
  const data: dataStr = getData();
  let uId:number;
  for (const user of data.users) {
    for (const i in user.tokenArray) {
      if (token === user.tokenArray[parseInt(i)]) {
        uId = user.userId;
      }
    }
  }
  const dmArray = [];
  for (const dm of data.dms) {
    if (dm.some(obj => obj.userIds === uId)) { // TODO
      const dmObj = {
        dmId: dmId, // TODO
        name: name
      };
      dmArray.push(dmObj);
    }
  }
  res.json({ dms: dmArray });
});

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

