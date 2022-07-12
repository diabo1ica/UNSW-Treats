import { getData, dataStr, setData } from './dataStore';

// Clears the dataStore
function clearV1() {
  const data: dataStr = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dmsIdCounter = 0;
  setData(data);
  return {};
}

export { clearV1 };
