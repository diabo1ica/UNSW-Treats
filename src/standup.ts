import { getData, setData } from './dataStore';
import { getCurrentTime, getChannel, isMember } from './util';
import HTTPError from 'http-errors';
import { AUTHORISATION_ERROR, INPUT_ERROR } from './tests/request';

export function startStandUp(authUserId: number, channelId: number, length: number) {
  const data = getData();
  let timeNow: number;
  const channelObj = getChannel(channelId);
  if (length < 0) throw HTTPError(INPUT_ERROR, 'Length cannot be negative');
  if (channelObj === undefined) throw HTTPError(INPUT_ERROR, 'Invalid Channel');
  if (!isMember(authUserId, channelObj)) throw HTTPError(AUTHORISATION_ERROR, 'Authorised user is not a member of the channel');
  if (channelObj.standUp.timeFinish > (timeNow = getCurrentTime())) throw HTTPError(INPUT_ERROR, 'Active standup currently running');
  channelObj.standUp.timeFinish = length + timeNow;
  setData(data);
  return {
    timeFinish: channelObj.standUp.timeFinish,
  };
}
