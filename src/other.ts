import { getData, DataStr, setData } from './dataStore';
import request from 'sync-request';
import fs from 'fs';
import config from './config.json';

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

export function uploadImage (authUserId: number, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const data: DataStr = getData();

  if (imgUrl.endsWith('.jpg') === false) {
    return { error400: 'Image is not .jpg' };
  }

  if (xEnd <= xStart || yEnd <= yStart) {
    return { error400: 'Invalid coordinate' };
  }
  const sharp = require('sharp');
  const res = request(
    'GET',
    imgUrl
  );

  const body = res.getBody();
  const pathWay = 'src/Image/' + String(authUserId) + '.jpg';
  fs.writeFileSync(pathWay, body, { flag: 'w' });

  const dimension = sharp(pathWay).metadata();
  if (xStart < 0 || xEnd > dimension.width || yStart < 0 || yEnd > dimension.width) {
    return { error400: 'Coordinate not in dimension' };
  }

  const xCoordinate = xEnd - xStart;
  const yCoordinate = yEnd - yStart;
  try {
    sharp(pathWay).extract({ width: xCoordinate, height: yCoordinate, left: xStart, top: yStart }).toFile('src/Image/' + String(authUserId) + 'edited.jpg');
    console.log('Cropping succesful');
  } catch (error) {
    console.log('Error');
  }

  for (const user of data.users) {
    if (user.userId === authUserId) {
      user.profileImgUrl = String(config.url) + ':' + String(config.port) + '/imgUrl/' + String(imgUrl);
    }
  }
  setData(data);
}
