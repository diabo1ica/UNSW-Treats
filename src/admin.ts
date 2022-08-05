import HTTPError from 'http-errors';
import { getData, setData, DataStr, User } from './dataStore';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';
import { validateUserId, getUser, OWNER } from './util';

export function adminUserPermChange(authUserId: number, uId: number, permissionId: number) {
  const data: DataStr = getData();
  const userObj: User = getUser(uId);
  const authuserObj: User = getUser(authUserId);
  let owners = 0;

  if (authuserObj.globalPermsId !== OWNER) throw HTTPError(AUTHORISATION_ERROR, 'authuser is not owner');
  if (!validateUserId(uId)) throw HTTPError(INPUT_ERROR, 'Invalid uId');
  if (permissionId !== 2) {
    if (permissionId !== 1) throw HTTPError(INPUT_ERROR, 'Invalid permissionId');
  }
  if (userObj.globalPermsId === permissionId) throw HTTPError(INPUT_ERROR, 'cannot give same permission');

  for (const owner of data.users) {
    if (owner.globalPermsId === OWNER) {
      owners++;
    }
  }

  if (owners === 1 && userObj.globalPermsId === OWNER) throw HTTPError(INPUT_ERROR, 'Cannot demote only global owner');

  userObj.globalPermsId = permissionId;
  setData(data);
  return {};
}
