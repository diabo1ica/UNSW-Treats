import { requestClear, requestRegister, requestDmCreate, requestDmList, requestDmRemove } from './request';
import { OK, INPUT_ERROR, AUTHORISATION_ERROR } from './request';

describe('dm remove tests', () => {
  let tokenId1: string;
  let tokenId2: string;
  let userId2: number;
  let userId3: number;
  let userId4: number;

  beforeEach(() => {
    requestClear();
    tokenId1 = requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan').body.token;
    const bodyObj = requestRegister('z3329234@unsw.edu.au', 'aero321', 'Gary', 'Ang').body;
    tokenId2 = bodyObj.token;
    userId2 = bodyObj.authUserId;
    userId3 = requestRegister('z1319832@unsw.edu.au', 'aero456', 'Kenneth', 'Kuo').body.authUserId;
    userId4 = requestRegister('z4234824@unsw.edu.au', 'aero654', 'David', 'Pei').body.authUserId;
  });

  test('Test dm remove', () => {
    const uIds1: number[] = [userId2, userId3];
    const dmId: number = requestDmCreate(tokenId1, uIds1).body.dmId;
    expect(requestDmRemove(tokenId1, dmId).statusCode).toStrictEqual(OK);
    expect(requestDmList(tokenId1).body).toStrictEqual(expect.objectContaining({ dms: [] }));
  });

  test('Test dm remove 1 dm of multiple', () => {
    const uIds1: number[] = [userId2, userId3];
    const uIds2: number[] = [userId2, userId4];
    const dmId: number = requestDmCreate(tokenId1, uIds1).body.dmId;
    requestDmCreate(tokenId1, uIds2);
    expect(requestDmRemove(tokenId1, dmId).statusCode).toStrictEqual(OK);
    expect(requestDmList(tokenId1).body).toStrictEqual(expect.objectContaining({
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
    const dmId: number = requestDmCreate(tokenId1, uIds1).body.dmId;
    const dmId2: number = requestDmCreate(tokenId1, uIds2).body.dmId;
    const tokenId3 = requestRegister('hero@gmail.com', 'Coursehero', 'Hiiro', 'Heroe').body.token;
    // Valid parameters
    expect(requestDmRemove(tokenId1, dmId).statusCode).toStrictEqual(OK);
    // Invalid dmId
    expect(requestDmRemove(tokenId1, dmId2 - 100).statusCode).toStrictEqual(INPUT_ERROR);
    // Invalid user
    expect(requestDmRemove(tokenId3, dmId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
    // Invalid permission
    expect(requestDmRemove(tokenId2, dmId2).statusCode).toStrictEqual(AUTHORISATION_ERROR);
  });
});
