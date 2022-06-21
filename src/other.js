import { getData } from './dataStore';

function clearV1() {
  let data = getData();
  data.users = [];
  data.channels = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  return {};
}

export { clearV1 };
