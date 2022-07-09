// YOU SHOULD MODIFY THIS OBJECT BELOW
interface user {
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    email: string,
    password: string,
    userId: number,
    globalPermsId: number
}

interface member {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  channelPermsId: number
}

interface channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  members: member[],  
  messages: string[], 
}

interface dataStr {
  users: user[],
  channels: channel[],
  userIdCounter: number,
  channelIdCounter: number
};

let data: dataStr = {
  users: [],
  channels: [],
  userIdCounter: 0,
  channelIdCounter: 0,
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

export { getData, setData, user, member, channel, dataStr };
