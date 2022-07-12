import request from 'sync-request';
import config from './config.json';
import { channelsCreateV1 } from './channels';

const OK = 200;
const port = config.port;
const url = config.url;

function registerAuth(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
          `${url}:${port}/auth/login/v2`,
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
      `${url}:${port}/clear/v1`,
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
      authUserId: expect.any(Number)
    });
    const res2 = registerAuth('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe');
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(OK);
    expect(bodyObj2).toEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Test logout', () => {
    const res = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const bodyObj = JSON.parse(res.body as string);
    const res2 = request(
      'POST',
            `${url}:${port}/auth/logout/v1`,
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

describe('channel path tests', () => {
  test('Test channel details', () => {
    const userRes = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const user = JSON.parse(userRes.body as string);
    const channel = channelsCreateV1(user.authUserId, 'Xhorhas', true);
    const res = request(
      'GET',
            `${url}:${port}channel/details/v2`,
            {
              qs: {
                token: user.token,
                channelId: channel.channelId
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
});
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
});*/
