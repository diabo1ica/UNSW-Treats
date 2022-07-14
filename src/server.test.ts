import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

const requestRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestClear = () => {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelsCreate = (token: string, name: string, isPublic: boolean) => {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        token: token,
        name: name,
        isPublic: isPublic,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v2',
    {
      qs: {
        token: token, 
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelInvite = (token: string, channelId: number, uId: number) => {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v2',
    {
      json: {
        token: token, 
        channelId: channelId,
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestUserProfile = (authUserId: number, uId: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v2',
    {
      qs: {
        authUserId: authUserId, 
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};


describe('channels path tests', () => {
  let userID : string;
  beforeEach(() => {
    requestClear();
    userID = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').token;
  });
  
  test('ChannelsCreate Successfull', () => {
    expect(requestChannelsCreate(userID, 'Channel1', true)).toStrictEqual(expect.objectContaining({
      channelId: expect.any(Number),
    }));
  });

  test('ChannelsCreate Unsuccessfull', () => {
    expect(requestChannelsCreate(userID, 'Iloveyoubabyandwillmarryyouchannel', true)).toStrictEqual({ error: 'error'});
  });

  test('ChannelsList Successfull', () => {
    const channelID = requestChannelsCreate(userID, 'Channel1', true).channelId;
    expect(requestChannelList(userID)).toStrictEqual({});
  });

  test('ChannelsList Unsuccessfull', () => {
    const channelID = requestChannelsCreate(userID, 'Channel1', true).channelId;
    expect(requestChannelList('-123')).toStrictEqual({ error: 'error' });
  });
});

/*
describe('channel path tests', () => {
  let userID : number;
  let userID2 : number;
  let channelID : number;
  beforeEach(() => {
    requestClear();
    userID = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').authUserId;
    userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').authUserId;
    channelID = requestChannelsCreate(userID, 'Channel1', true).channelId;
  });

  test('ChannelInvite Successfull', () => {
    expect(requestChannelInvite(userID, channelID, userID2)).toStrictEqual({});
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestChannelInvite(userID, channelID, -123)).toStrictEqual({ error: 'error' });
  });
  
});

describe('users path tests', () => {
  let userID : number;
  beforeEach(() => {
    requestClear();
    userID = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').authUserId;
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestUserProfile(-123, -321)).toStrictEqual({ error: 'error' });
  });

});*/