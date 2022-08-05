import { getData, DataStr, setData } from './dataStore';

// Clears the dataStore
export function clearV1() {
  const data: DataStr = getData();
  data.users = [];
  data.channels = [];
  data.userIdCounter = 0;
  data.channelIdCounter = 0;
  data.dmIdCounter = 0;
  data.messageIdCounter = 0;
  data.tokenArray = [];
  data.dms = [];
  data.messages = [];
  data.resetArray = [];
  data.removedUsers = [];
  data.updates = [];
  data.userUpdates = [];
  setData(data);
  return {};
}

export function searchV1 (queryStr: string) {
  if (queryStr.length < 1 || queryStr.length > 1000) {
    return { error400: 'Invalid QueryStr' };
  }
  const data: DataStr = getData();
  const returnMessage: any[] = [];

  for (const msg of data.messages) {
    const lowMsg: string = msg.message.toLowerCase();
    const lowQuery: string = queryStr.toLowerCase();
    if (lowMsg.includes(lowQuery)) {
      returnMessage.push({
        messageId: msg.messageId,
        uId: msg.uId,
        message: msg.message,
        timeSent: msg.timeSent,
        reacts: msg.reacts,
        isPinned: msg.isPinned
      });
    }
  }

  return {
    messages: returnMessage,
  };
}
