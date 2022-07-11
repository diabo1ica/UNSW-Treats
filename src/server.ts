import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
<<<<<<< HEAD
import { channelsCreateV1 } from './channels';
=======
import { authRegisterV1 } from './auth.ts';
import { channelDetailsV1 } from './channel';
import { getData, setData, user, dataStr } from './dataStore';
import { clearV1 } from './other';
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0

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

<<<<<<< HEAD
app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  const channelId = channelsCreateV1(token, name, isPublic);
  res.json({
    channelId: channelId,
  }); 
});

app.get('channels/list/v2', (
=======
app.post('/auth/register/v2', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const id = authRegisterV1(email, password, nameFirst, nameLast);
  const data: dataStr = getData;
  let token = '';
  for (const user of data.users) {
    if (id.authUserId === user.authUserId) {
      token = generateToken();
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
  const data: dataStr = getData;
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
  const data: dataStr = getData;
  let userId = 0;
  for (const user of data.users) {
    if (user.some(obj => obj.tokenArray === token)) {
      userId = user.userId;
      break;
    }
  }
  res.json(channelDetailsV1(userId, chId));
});

app.get('/dm/list/v1', (req, res) => {
  const token = req.query.token as string;
  const data: dataStr = getData;
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
    if (dm.some(obj => obj.userIds === uId)) {
      const dmObj = {
        dmId: dmId,
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
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

function generateToken() {
  const token: number = Math.random() * Number.MAX_VALUE;
  const tokenStr: string = token.toString();
  const data: dataStr = getData();
  for (const user of data.users) {
    // Loop to find duplicate
    for (const userToken of user.tokenArray) {
      if (tokenStr === userToken) {
        return generateToken(); // Recursion
      }
    }
  }
  return tokenStr;
}
