import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

function registerAuth(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );
  return res;
}


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

const requestLogin = (email: string, password: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email: email,
        password: password,
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

const requestChannelsList = (token: string) => {
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

const requestUserProfile = (token: string, uId: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v2',
    {
      qs: {
        token: token, 
        uId: uId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestRemoveOwner = (token: string, channelId: number, uId: number) => {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v1',
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

const requestSetname = (token: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setname/v1',
    {
      json: {
        token: token, 
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestSetemail = (token: string, email: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setemail/v1',
    {
      json: {
        token: token, 
        email: email,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};


describe('channels path tests', () => {
  let userID : string;
  let token;
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
    expect(requestChannelsCreate(userID, 'Iloveyoubabyandwillmarryyouchannel', true)).toStrictEqual({ error: 'error' });
  });

  test('ChannelsList Successfull', () => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    token = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    requestChannelsCreate(token, 'Channel1', true);
    expect(requestChannelsList(token)).toStrictEqual({
      channels: expect.arrayContaining([
        {
          channelId: expect.any(Number),
          name: 'Channel1',
        }
      ])
    });
  });

  test('ChannelsList Unsuccessfull', () => {
    expect(requestChannelsList(userID)).toStrictEqual({
      channels: [],
    });
  });
});

describe('channel path tests', () => {
  let userID2 : number;
  let channelID : number;
  let token : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.token;
    userID = obj.authUserId;
    userID2 = requestRegister('Iloveyou@gmail.com', 'Disney123', 'Kanoi', 'Senpai').authUserId;
    channelID = requestChannelsCreate(token, 'Channel1', true).channelId;
  });

  test('ChannelInvite Successfull', () => {
    expect(requestChannelInvite(token, channelID, userID2)).toStrictEqual({});
  });

  test('ChannelInvite Unsuccessfull', () => {
    expect(requestChannelInvite(token, channelID, -123)).toStrictEqual({ error: 'error' });
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestRemoveOwner(token, channelID, userID)).toStrictEqual({ error: 'error' });
  });

  test('ChannelRemoveOwner Unsuccessfull', () => {
    expect(requestRemoveOwner(token, -channelID, userID)).toStrictEqual({ error: 'error' });
  });
  
});

describe('users path tests', () => {
  let token : string;
  let userID : number;
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.token;
    userID = obj.authUserId;
  });

  test('UserProfile Successfull', () => {
    expect(requestUserProfile(token, userID)).toStrictEqual({
      user: {
        uId: userID,
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'JingisuKan',
      }
    });
  });
   
  test('UserProfile Unsuccessfull', () => {
    expect(requestUserProfile(token, -321)).toStrictEqual({ error: 'error' });
  });

  test('SetName & SetEmail Successfull', () => {
    requestSetname(token, 'Kennt', 'Alex');
    requestSetemail(token, 'Iloveyou@gmail.com');
    expect(requestUserProfile(token, userID)).toStrictEqual({ 
      user: {
        uId: userID,
        email: 'Iloveyou@gmail.com',
        nameFirst: 'Kennt',
        nameLast: 'Alex',
        handleStr: 'JingisuKan',
      }
    });
  });


});