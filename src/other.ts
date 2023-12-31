import { getData, DataStr, setData } from './dataStore';

// Clears the dataStore
function clearV1() {
  const data: DataStr = getData();
  data.users = [];
  data.channels = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dmIdCounter = 0;
  data.messageIdCounter = 0;
  data.tokenArray = [];
  data.dms = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dmIdCounter = 0;
  data.messageIdCounter = 0;
  data.tokenArray = [];
  setData(data);
  return {};
}

export { clearV1 };
