import fs from 'fs';
// YOU SHOULD MODIFY THIS OBJECT BELOW
interface user {
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  email: string,
  password: string,
  userId: number,
  globalPermsId: number,
}

interface member {
  uId: number,
  channelPermsId: number
}

interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

interface channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  members: member[],
  messages: message[],
}

interface dmMember {
  uId: number,
  dmPermsId: number,
}

interface dm {
  members: dmMember[],
  messages: message[],
  dmId: number,
  creatorId: number,
  name: string
}

interface dataStr {
  users: user[],
  channels: channel[],
  dms: dm[],
  tokenArray: string[],
  userIdCounter: number,
  channelIdCounter: number,
  dmIdCounter: number,
  messageIdCounter: number,
}

let data: dataStr = {
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
function setData(newData: dataStr, name = './data.json') {
  fs.writeFileSync(name, JSON.stringify(newData, null, 4));
  data = newData;
}

export { getData, setData, user, member, channel, dataStr, dm, message, dmMember };
