import { query } from 'express';
import createHttpError from 'http-errors';
import { rootCertificates } from 'tls';
import { reduceEachTrailingCommentRange } from 'typescript';
import { getData, DataStr, setData } from './dataStore';
import { messageSendDm } from './dm';

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

export function searchV1 (queryStr: string) {
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw createHttpError(400, 'queryStr invalid');
  }
  const data: DataStr = getData();
  const returnMessage: any[] = [];
  
  for (const channel of data.channels) {
    for (const msg of channel.messages) {
      if (msg.message.includes(queryStr)) {
        returnMessage.push( {
          messageId: msg.messageId,
          uId: msg.uId,
          message: msg.message,
          timeSent: msg.timeSent,
          reacts: '??',
          isPinned: true,
        });
      }
    }
  }

  return {
    messages: returnMessage,
  };
}

export { clearV1 };
