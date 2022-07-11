import request from 'sync-request';
import config from './config.json';
const { channelsCreateV1 } from './channels';

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


describe('channels path tests', () => {
  beforeEach(() => {
    request(
      'DELETE',
      `${url}:${port}/clear/v1`,
      {
        qs: {}
      }
    );
  });
  
  test('Test successful channels Create', () => {
    const res = registerAuth('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const bodyObj = JSON.parse(res.body as string);
    bodyObj.token = 'one';
    expect(res.statusCode).toBe(OK);
    const res2 = registerAuth('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe');
    const bodyObj2 = JSON.parse(res2.body as string);
    expect(res2.statusCode).toBe(OK);
    const res3 = channelsCreateV1('one', '', true);
    const bodyObj3 = JSON.parse(res3.body as string);
    expect(res3.statusCode).toBe(OK);
    expect(bodyObj3).toEqual({
      channelId: expect.any(Number)
    });
  });
});


