// @ts-nocheck
import { getData, dataStr } from './dataStore';

// Clears the dataStore 
function clearV1() {
  let data: dataStr = getData();
  data.users = [];
  data.channels = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  return {};
}

export { clearV1 };

