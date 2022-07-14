import request from 'sync-request';
import config from './config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
const OK = 200;

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

const generateMessage = (length: number): string => {
  let message = '';
  for (let i = 0; i < length; i++) {
    message += String.fromCharCode(Math.floor(Math.random() * 26) % 26 + 97);
  }
  return message;
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
