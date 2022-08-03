import fs from 'fs';
export const THUMBSUP = 1;
export const VALIDREACTS = [THUMBSUP];

export interface User {
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  email: string,
  password: string,
  userId: number,
  globalPermsId: number,
}

export interface Member {
  uId: number,
  channelPermsId: number
}

export interface React {
  reactId: number,
  uIds: number[],
  isThisUserReacted?: boolean
}

export interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  isPinned: boolean,
  reacts?: React[],
  dmId?: number,
  channelId?: number,
}

export interface StandUp {
  timeFinish: number,
  messageId: number,
}

export interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  members: Member[],
  standUp: StandUp,
}

export interface DmMember {
  uId: number,
  dmPermsId: number,
}

export interface Dm {
  members: DmMember[],
  dmId: number,
  creatorId: number,
  name: string
}

interface Reset {
  uId: number,
  resetCode: string
}

export interface DataStr {
  users: User[],
  channels: Channel[],
  dms: Dm[],
  messages: Message[],
  tokenArray: string[],
  userIdCounter: number,
  channelIdCounter: number,
  dmIdCounter: number,
  messageIdCounter: number,
  resetArray: Reset[]
}

let data: DataStr = {
  users: [],
  channels: [],
  dms: [],
  messages: [],
  tokenArray: [],
  userIdCounter: 0,
  channelIdCounter: 0,
  dmIdCounter: 0,
  messageIdCounter: 0,
  resetArray: []
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
export function getData(load = false, name = 'data.json') {
  if (load === true && fs.existsSync(name)) {
    const loadedData = JSON.parse(fs.readFileSync('./' + name, { encoding: 'utf8' }));
    data = loadedData;
    console.log(`'${name}' successfully loaded`);
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataStr, name = './data.json') {
  fs.writeFileSync(name, JSON.stringify(newData, null, 4));
  data = newData;
}
