import request from 'sync-request';
import config from './config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

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
  let userId2: number;
  let userId3: number;
  let userId4: number;

  beforeEach(() => {
    requestClear();
    tokenId1 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').token;
    userId2 = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').authUserId;
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
