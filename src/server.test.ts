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
    const res = requestDmMessages(token2, dmId1, 0)
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
    }))
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
}

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
