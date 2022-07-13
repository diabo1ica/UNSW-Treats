import { getData, dataStr, setData } from './dataStore';

// Clears the dataStore
function clearV1() {
  const data: dataStr = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dmIdCounter = 0;
  data.tokenArray = [];
  setData(data);
  return {};
}

export { clearV1 };
