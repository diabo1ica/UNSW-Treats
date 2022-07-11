interface user {
<<<<<<< HEAD
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    email: string,
    password: string,
    userId: number,
    globalPermsId: number,
    tokenArray: string[]
=======
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  email: string,
  password: string,
  userId: number,
  globalPermsId: number,
  tokenArray: string[]
>>>>>>> e8f4b6293d6e761f79ee7e113196b2b43be7bfc0
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

interface dm {
  userIds: number[],
  messages: message[],
  dmId: number,
  ownerId: number,
  name: string
}

interface message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
}

interface dm {
  userIds: number[],
  messages: message[],
  dmId: number,
  ownerId: number,
  name: string,
}

interface dataStr {
  users: user[],
  channels: channel[],
  dms: dm[]
}

let data: dataStr = {
  users: [],
  channels: [],
  dms: []
};

let data: dataStr = {
  users: [],
  channels: [],
  dms: [],
  userIdCounter = 0,
  channelIdCounter = 0,
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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataStr) {
  data = newData;
}

export { getData, setData, user, member, channel, dataStr, dm, message };
