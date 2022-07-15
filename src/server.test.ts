import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

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

// Gary's tests
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
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function createChan(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        token: token,
        name: name,
        isPublic: isPublic
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function logOut(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/logout/v1',
    {
      json: {
        token: token
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function chDetails(token: string, chId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v2',
    {
      qs: {
        token: token,
        channelId: chId
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function dmList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/list/v1',
    {
      qs: {
        token: token,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

function dmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/dm/remove/v1',
    {
      qs: {
        token: token,
        dmId: dmId
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.body as string);
}

describe('auth path tests', () => {
  beforeEach(() => {
    requestClear();
  });

  test('Test successful and unsuccessful auth register', () => {
    const res = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    expect(res).toEqual({
      token: expect.any(String),
      authUserId: 1
    });
    const res2 = registerAuth('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe');
    expect(res2).toEqual({
      token: expect.any(String),
      authUserId: 2
    });
    const res3 = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    expect(res3).toEqual({ error: 'error' });
  });

  test('Test logout', () => {
    const bodyObj = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const bodyObj2 = logOut(bodyObj.token);
    expect(bodyObj2).toStrictEqual({});
    const channel = createChan(bodyObj.token, 'Xhorhas', true);
    expect(channel).toStrictEqual({ error: 'error' });
  });
});

describe('channel path tests', () => {
  let userToken: string;
  let channelId: number;
  beforeEach(() => {
    requestClear();
    userToken = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').token;
    channelId = createChan(userToken, 'Xhorhas', true).channelId;
  });

  test('Test channel details', () => {
    const bodyObj = chDetails(userToken, channelId);
    expect(bodyObj).toEqual({
      name: 'Xhorhas',
      isPublic: true,
      ownerMembers: [{
        uId: expect.any(Number),
        email: 'Alalalyeehoo@gmail.com',
        nameFirst: 'Jingisu',
        nameLast: 'Kan',
        handleStr: 'JingisuKan'
      }],
      allMembers: []
    });
  });

  test('Test Invalid channel details', () => {
    const bodyObj = chDetails(userToken, -100);
    expect(bodyObj).toEqual({ error: 'error' });
    logOut(userToken);
    const bodyObj2 = chDetails(userToken, channelId);
    expect(bodyObj2).toEqual({ error: 'error' });
  });
});

describe('dm path tests', () => {
  let tokenId1: string;
  let tokenId2: string;
  let userId2: number;
  let userId3: number;
  let userId4: number;

  beforeEach(() => {
    requestClear();
    tokenId1 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').token;
    const bodyObj = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
    tokenId2 = bodyObj.token;
    userId2 = bodyObj.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
  });

  test('Test dm list', () => {
    const uIds1: number[] = [userId2, userId3];
    const uIds2: number[] = [userId2, userId4];
    const uIds3: number[] = [userId3, userId4];
    const uIds4: number[] = [userId2, userId3, userId4];
    requestDmCreate(tokenId1, uIds1);
    requestDmCreate(tokenId1, uIds2);
    requestDmCreate(tokenId1, uIds3);
    requestDmCreate(tokenId1, uIds4);
    expect(dmList(tokenId1)).toStrictEqual({
      dms: [
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        },
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        },
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        },
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        }
      ]
    });
  });

  test('Test dm remove', () => {
    const uIds1: number[] = [userId2, userId3];
    const dmId: number = requestDmCreate(tokenId1, uIds1).dmId;
    expect(dmRemove(tokenId1, dmId)).toStrictEqual({});
    expect(dmList(tokenId1)).toStrictEqual(expect.objectContaining({ dms: [] }));
  });

  test('Test dm remove 1 dm of multiple', () => {
    const uIds1: number[] = [userId2, userId3];
    const uIds2: number[] = [userId2, userId4];
    const dmId: number = requestDmCreate(tokenId1, uIds1).dmId;
    requestDmCreate(tokenId1, uIds2);
    expect(dmRemove(tokenId1, dmId)).toStrictEqual({});
    expect(dmList(tokenId1)).toStrictEqual(expect.objectContaining({
      dms: [
        {
          dmId: expect.any(Number),
          name: expect.any(String)
        }
      ]
    }));
  });

  test('Test remove invalid parameters', () => {
    const uIds1: number[] = [userId2, userId3];
    const uIds2: number[] = [userId2, userId4];
    const dmId: number = requestDmCreate(tokenId1, uIds1).dmId;
    const dmId2: number = requestDmCreate(tokenId1, uIds2).dmId;
    const tokenId3 = registerAuth('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe').token;
    expect(dmRemove(tokenId1, dmId)).toStrictEqual({});
    expect(dmRemove(tokenId1, dmId2 - 100)).toStrictEqual({ error: 'error' });
    expect(dmRemove(tokenId3, dmId2)).toStrictEqual({ error: 'error' });
    expect(dmRemove(tokenId2, dmId2)).toStrictEqual({ error: 'error' });
  });
});

// Steve's tests
describe('Test suite for /auth/login/v2', () => {
  let userId1: number;
  beforeEach(() => {
    requestClear();
    userId1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
  });

  test('Email doesn\'t belong to a user', () => {
    expect(requestLogin('z5363496@unsw.edu.au', 'aero123')).toStrictEqual({ error: 'error' });
  });

  test('Password is not correct', () => {
    expect(requestLogin('z5363495@unsw.edu.au', 'aero12')).toStrictEqual({ error: 'error' });
  });

  test('User Login', () => {
    expect(requestLogin('z5363495@unsw.edu.au', 'aero123')).toStrictEqual(expect.objectContaining({
      token: expect.any(String),
      authUserId: userId1
    }));
  });
});

describe('Test suite for /channels/listall/v2', () => {
  let channelId1: number, channelId2: number, channelId3: number, channelId4: number;
  let token1: string, token2: string, token3: string, token4:string;

  describe('Error cases', () => {
    beforeEach(() => {
      requestClear();
      requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
      requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
      token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
      token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    });

    test('No channels were created', () => {
      expect(requestChannelslistall(token1).channels).toStrictEqual([]);
    });

    test('Invalid token', () => {
      expect(requestChannelslistall(token2 + '3')).toStrictEqual({ error: 'error' });
    });
  });

  describe('Working cases', () => {
    beforeEach(() => {
      requestClear();
      requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
      requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
      requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
      requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei');
      token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
      token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
      token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').token;
      token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').token;
      channelId1 = requestChannelsCreate(token1, 'Aero', true).channelId;
      channelId2 = requestChannelsCreate(token2, 'Aero1', true).channelId;
      channelId3 = requestChannelsCreate(token3, 'Aero2', false).channelId;
      channelId4 = requestChannelsCreate(token4, 'Aero3', false).channelId;
    });

    test('Correct output (list 4 channels)', () => {
      expect(requestChannelslistall(token1)).toStrictEqual(expect.objectContaining(
        {
          channels: expect.arrayContaining([
            {
              channelId: channelId1,
              name: 'Aero',
            },
            {
              channelId: channelId2,
              name: 'Aero1',
            },
            {
              channelId: channelId3,
              name: 'Aero2',
            },
            {
              channelId: channelId4,
              name: 'Aero3',
            }
          ])
        }));
    });
  });
});

describe('Test suite for /channel/messages/v2', () => {
  let channelId1: number, channelId2: number;
  let token1: string, token2: string, token3: string;
  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang');
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei');
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').token;
    channelId1 = requestChannelsCreate(token1, 'Aero', true).channelId;
    channelId2 = requestChannelsCreate(token2, 'Aero1', true).channelId;
  });

  test('Invalid Token', () => {
    expect(requestChannelMessages('-' + token2, channelId2, 0)).toStrictEqual({ error: 'error' });
  });

  test('Invalid channelId', () => {
    expect(requestChannelMessages(token1, -channelId1, 0)).toStrictEqual({ error: 'error' });
  });

  test('Start is greater than total number messages', () => {
    expect(requestChannelMessages(token1, channelId1, 10000000)).toStrictEqual({ error: 'error' });
  });

  test('User is not a member of valid channel', () => {
    expect(requestChannelMessages(token3, channelId1, 0)).toStrictEqual({ error: 'error' });
  });

  test('Correct return type', () => {
    expect(requestChannelMessages(token1, channelId1, 0)).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([]),
        start: 0,
        end: -1,
      }));
  });
});

describe('Test suite for /dm/create/v1', () => {
  let userId2: number, userId3: number, userId4: number;
  let token1: string;

  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
  });

  test('uIds contains an invalid uId', () => {
    const uIds = [userId2, -userId3, userId4];
    expect(requestDmCreate(token1, uIds)).toStrictEqual({ error: 'error' });
  });

  test('Duplicate \'uIds\' in uIds', () => {
    const uIds = [userId2, userId2, userId4];
    expect(requestDmCreate(token1, uIds)).toStrictEqual({ error: 'error' });
  });

  test('Correct output', () => {
    const uIds = [userId2, userId3, userId4];
    expect(requestDmCreate(token1, uIds)).toStrictEqual({ dmId: expect.any(Number) });
  });
});

describe('Test suite for /message/senddm/v1', () => {
  let userId2: number, userId3: number, userId4: number;
  let dmId1: number, dmId2: number, dmId3: number, dmId4: number;
  let token1: string, token2: string, token3: string;

  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).dmId;
    dmId3 = requestDmCreate(token1, [userId3, userId4]).dmId;
    dmId4 = requestDmCreate(token1, [userId2, userId4]).dmId;
  });

  test('dmId is invalid', () => {
    expect(requestSendDm(token1, -dmId2, 'HELLO')).toStrictEqual({ error: 'error' });
  });

  test('Message is empty (less than 1 character)', () => {
    expect(requestSendDm(token3, dmId1, '')).toStrictEqual({ error: 'error' });
  });

  test('Message is over 1000 characters', () => {
    const message = generateMessage(1200);
    expect(requestSendDm(token2, dmId3, message)).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but authorised user is not a member', () => {
    expect(requestSendDm(token3, dmId4, 'HIIII')).toStrictEqual({ error: 'error' });
  });

  test('Invalid token', () => {
    expect(requestSendDm('-' + token3, dmId1, 'HLELO')).toStrictEqual({ error: 'error' });
  });

  test('Correct output', () => {
    expect(requestSendDm(token1, dmId3, 'yooooooooooooooooo')).toStrictEqual(expect.objectContaining(
      {
        messageId: expect.any(Number)
      }
    ));
  });
});

describe('Test suite for /dm/details/v1', () => {
  let userId1: number, userId2: number, userId4: number;
  let dmId1: number;
  let token1: string, token2: string, token3: string;

  beforeEach(() => {
    requestClear();
    userId1 = requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi').authUserId;
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo');
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').token;
    dmId1 = requestDmCreate(token1, [userId2, userId4]).dmId;
  });

  test('Invalid token', () => {
    expect(requestDmDetails('-' + token1, dmId1)).toStrictEqual({ error: 'error' });
  });

  test('Invalid dmId', () => {
    expect(requestDmDetails(token1, dmId1 + 1)).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but authorised user is not a member', () => {
    expect(requestDmDetails(token3, dmId1)).toStrictEqual({ error: 'error' });
  });

  test('Correct output', () => {
    expect(requestDmDetails(token2, dmId1)).toStrictEqual(expect.objectContaining(
      {
        name: 'DavidPei, GaryAng, SteveBerrospi',
        members: expect.arrayContaining([expect.objectContaining(
          {
            uId: userId1,
            email: 'z5363495@unsw.edu.au',
            nameFirst: 'Steve',
            nameLast: 'Berrospi',
            handleStr: 'SteveBerrospi'
          }), expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'GaryAng'
          }), expect.objectContaining(
          {
            uId: userId4,
            email: 'z4234824@unsw.edu.au',
            nameFirst: 'David',
            nameLast: 'Pei',
            handleStr: 'DavidPei'
          }
        )
        ])
      }
    ));
  });
});

describe('Test suite for /dm/messages/v1', () => {
  let userId2: number, userId3: number, userId4: number;
  let dmId1: number;
  let token1: string, token2: string, token3: string, token4:string;

  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    token3 = requestLogin('z1319832@unsw.edu.au', 'aero456').token;
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).dmId;
  });

  test('Invalid token', () => {
    expect(requestDmMessages('-' + token1, dmId1, 0)).toStrictEqual({ error: 'error' });
  });

  test('Invalid dmId', () => {
    expect(requestDmMessages(token1, -dmId1, 0)).toStrictEqual({ error: 'error' });
  });

  test('start is greater than total messages', () => {
    sendMessages(token2, dmId1, 30, 10);
    expect(requestDmMessages(token1, dmId1, 31)).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but authorised user is not a member', () => {
    const dmId2 = requestDmCreate(token1, [userId2, userId4]).dmId;
    sendMessages(token1, dmId2, 60, 5);
    expect(requestDmMessages(token3, dmId2, 0)).toStrictEqual({ error: 'error' });
  });

  test('Correct Output (start = 0)(59 messages sent)', () => {
    sendMessages(token1, dmId1, 15, 5);
    sendMessages(token2, dmId1, 15, 10);
    sendMessages(token3, dmId1, 10, 5);
    sendMessages(token4, dmId1, 19, 8);
    const res = requestDmMessages(token2, dmId1, 0);
    expect(res).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([expect.objectContaining(
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: expect.any(String),
            timeSent: expect.any(Number)
          }
        )]),
        start: 0,
        end: 50,
      }
    ));
    for (let i = 0; i < res.messages.length - 2; i++) {
      expect(res.messages[i].timeSent).toBeGreaterThanOrEqual(res.messages[i].timeSent);
    }
  });

  test('Correct Output (start = 45)(59 messages sent)', () => {
    sendMessages(token1, dmId1, 15, 5);
    sendMessages(token2, dmId1, 15, 10);
    sendMessages(token3, dmId1, 10, 5);
    sendMessages(token4, dmId1, 19, 8);
    const res = requestDmMessages(token2, dmId1, 45);
    expect(res).toStrictEqual(expect.objectContaining(
      {
        messages: expect.arrayContaining([expect.objectContaining(
          {
            messageId: expect.any(Number),
            uId: expect.any(Number),
            message: expect.any(String),
            timeSent: expect.any(Number)
          }
        )]),
        start: 45,
        end: -1
      }
    ));
    for (let i = 0; i < res.messages.length - 2; i++) {
      expect(res.messages[i].timeSent).toBeGreaterThanOrEqual(res.messages[i].timeSent);
    }
  });

  test('Correct Output (start = 50)(50 messages sent)', () => {
    sendMessages(token1, dmId1, 50, 2);
    expect(requestDmMessages(token3, dmId1, 50)).toStrictEqual(expect.objectContaining({
      messages: [],
      start: 50,
      end: -1
    }));
  });
});

describe('Test suite for dm/leave/v1', () => {
  let userId2: number, userId3: number, userId4: number;
  let dmId1: number, dmId2: number;
  let token1: string, token2: string, token4: string;

  beforeEach(() => {
    requestClear();
    requestRegister('z5363495@unsw.edu.au', 'aero123', 'Steve', 'Berrospi');
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').authUserId;
    token1 = requestLogin('z5363495@unsw.edu.au', 'aero123').token;
    token2 = requestLogin('z3329234@unsw.edu.au', 'aero321').token;
    token4 = requestLogin('z4234824@unsw.edu.au', 'aero654').token;
    dmId1 = requestDmCreate(token1, [userId2, userId4, userId3]).dmId;
    dmId2 = requestDmCreate(token1, [userId3, userId2]).dmId;
  });

  test('Invalid token', () => {
    expect(requestDmLeave('-123', dmId1)).toStrictEqual({ error: 'error' });
  });

  test('dmId refers to invalid DM', () => {
    expect(requestDmLeave(token1, -dmId1)).toStrictEqual({ error: 'error' });
  });

  test('dmId is valid but user is not a member of the DM', () => {
    expect(requestDmLeave(token4, dmId2)).toStrictEqual({ error: 'error' });
  });

  test('Correct Output', () => {
    expect(requestDmLeave(token2, dmId2)).toStrictEqual({});
    expect(requestDmDetails(token1, dmId2)).toStrictEqual(expect.objectContaining(
      {
        name: 'GaryAng, KennethKuo, SteveBerrospi',
        members: expect.not.arrayContaining([expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'GaryAng'
          }
        )])
      }
    ));
    expect(requestDmLeave(token2, dmId1)).toStrictEqual({});
    expect(requestDmDetails(token1, dmId1)).toStrictEqual(expect.objectContaining(
      {
        name: 'DavidPei, GaryAng, KennethKuo, SteveBerrospi',
        members: expect.not.arrayContaining([expect.objectContaining(
          {
            uId: userId2,
            email: 'z3329234@unsw.edu.au',
            nameFirst: 'Gary',
            nameLast: 'Ang',
            handleStr: 'GaryAng'
          }
        )])
      }
    ));
  });
});

const generateMessage = (length: number): string => {
  let message = '';
  for (let i = 0; i < length; i++) {
    message += String.fromCharCode(Math.floor(Math.random() * 26) % 26 + 97);
  }
  return message;
};

const sendMessages = (token: string, dmId: number, numberOfMessages: number, length: number) => {
  for (let i = 0; i < numberOfMessages; i++) {
    requestSendDm(token, dmId, generateMessage(length));
  }
};

const requestClear = () => {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

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

const requestChannelslistall = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/channels/listall/v2',
    {
      qs: {
        token: token
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestChannelMessages = (token: string, channelId: number, start: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/channel/messages/v2',
    {
      qs: {
        token: token,
        channelId: channelId,
        start: start
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestDmCreate = (token: string, uIds: number[]) => {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v1',
    {
      json: {
        token: token,
        uIds: uIds
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestSendDm = (token: string, dmId: number, message: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v1',
    {
      json: {
        token: token,
        dmId: dmId,
        message: message
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestDmLeave = (token: string, dmId: number) => {
  const res = request(
    'POST',
    SERVER_URL + '/dm/leave/v1',
    {
      json: {
        token: token,
        dmId: dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
};

const requestDmMessages = (token: string, dmId: number, start: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/dm/messages/v1',
    {
      qs: {
        token: token,
        dmId: dmId,
        start: start
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};

const requestDmDetails = (token: string, dmId: number) => {
  const res = request(
    'GET',
    SERVER_URL + '/dm/details/v1',
    {
      qs: {
        token: token,
        dmId: dmId,
      }
    }
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return JSON.parse(res.getBody() as string);
};
