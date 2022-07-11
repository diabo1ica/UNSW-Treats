import { getData, dataStr } from './dataStore';

// Clears the dataStore
function clearV1() {
  const data: dataStr = getData();
  data.users = [];
  data.channels = [];
  data.dms = [];
  return {};
}

export { clearV1 };
