import request from 'sync-request';
import config from './config.json';
import { channelsCreateV1 } from './channels';
const port = config.port;
const url = config.url;

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
  return res;
}

describe('auth path tests', () => {
  beforeEach(() => {
    request(
      'DELETE',
      SERVER_URL + '/clear/v1',
      {
        qs: {}
      }
    );
  });

  test('Test successful auth register', () => {
    const res = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({
      token: expect.any(String),
      authUserId: 1
    });
    const res2 = registerAuth('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe');
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj2).toEqual({
      token: expect.any(String),
      authUserId: 2
    });
  });

  test('Test logout', () => {
    const res = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const bodyObj = JSON.parse(res.body as string);
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: bodyObj.token
        }
      }
    );
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(bodyObj2).toStrictEqual({});
  });
});
/*
describe('channel path tests', () => {
  beforeEach(() => {
    requestClear();
  });
  
  test('Test channel details', () => {
    const userRes = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const user = JSON.parse(userRes.body as string);
    const channel = channelsCreateV1(user.authUserId, 'Xhorhas', true);
    expect(channel).toEqual({
      channelId: 1
    });
    const res = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: user.token,
          channelId: 1
        }
      }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
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
});*/
/*
describe('dm path tests', () => {
  test('Test dm list', () => {
    const res = request(
      'GET',
            `${url}:${port}dm/list/v1`,
            {
              qs: {
                token: ''
              }
            }
    );
    // const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
  });

  test('Test dm remove', () => {
    const res = request(
      'GET',
            `${url}:${port}dm/remove/v1`,
            {
              qs: {
                token: '',
                dmId: 0,
              }
            }
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });
}); */

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
