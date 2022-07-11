import { getData, dataStr } from './dataStore';

// Clears the dataStore
function clearV1() {
  const data: dataStr = getData();
  data.users = [];
  data.channels = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dms = [];
  return {};
}

export { clearV1 };
