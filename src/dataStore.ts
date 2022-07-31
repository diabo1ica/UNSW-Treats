import fs from 'fs';
interface User {
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  email: string,
  password: string,
  userId: number,
  globalPermsId: number,
}

interface Member {
  uId: number,
  channelPermsId: number
}

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  members: Member[],
  messages: Message[],
}

interface DmMember {
  uId: number,
  dmPermsId: number,
}

interface Dm {
  members: DmMember[],
  messages: Message[],
  dmId: number,
  creatorId: number,
  name: string
}

interface DataStr {
  users: User[],
  channels: Channel[],
  dms: Dm[],
  tokenArray: string[],
  userIdCounter: number,
  channelIdCounter: number,
  dmIdCounter: number,
  messageIdCounter: number,
}

let data: DataStr = {
  users: [],
  channels: [],
  dms: [],
  tokenArray: [],
  userIdCounter: 0,
  channelIdCounter: 0,
  dmIdCounter: 0,
  messageIdCounter: 0,
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
  let store = getData()
  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

  names = store.names

  names.pop()
  names.push('Jake')

  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
  setData(store)
*/

// Use get() to access the data
function getData(load = false, name = './data.json') {
  if (load === true && fs.existsSync(name)) {
    const loadedData = JSON.parse(fs.readFileSync(name, { encoding: 'utf8' }));
    data.users = loadedData.users;
    data.channels = loadedData.channels;
    data.dms = loadedData.dms;
    console.log('\'data.json\' successfully loaded');
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStr, name = './data.json') {
  fs.writeFileSync(name, JSON.stringify(newData, null, 4));
  data = newData;
}

export { getData, setData, User, Member, Channel, DataStr, Dm, Message, DmMember };
