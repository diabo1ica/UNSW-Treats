import { requestClear, requestRegister, requestDmCreate, requestDmList } from './request';
import { OK, AUTHORISATION_ERROR } from './request';

describe('dm list tests', () => {
  let tokenId1: string;
  let userId2: number;
  let userId3: number;
  let userId4: number;

  beforeEach(() => {
    requestClear();
    tokenId1 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    const bodyObj = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    userId2 = bodyObj.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
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
    const list = requestDmList(tokenId1);
    expect(list.statusCode).toStrictEqual(OK);
    expect(list.body).toStrictEqual({
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

  test('Test error dm list', () => {
    const list = requestDmList('hiyahiyahiyahiyahiya');
    expect(list.statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
