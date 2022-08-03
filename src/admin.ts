import { getData, setData } from './dataStore';
import { getCurrentTime, getChannel, isMember } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { messageSendV1 } from './channel';

export function adminUserPermChange(authUserId: number, uId: number, permissionId: number) {
    const data = getData();

    
}