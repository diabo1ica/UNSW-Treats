<<<<<<< HEAD
import { getData, setData } from './dataStore';

/*
Takes in a message and returns an array of string that contains all handles tagged in the message
*/
function tagChecker(message: string) {
  const string: string[] = message.split(' ');
  const array: string[] = [];
  const array2: string[] = [];
  let res = '';
  // Filters out words that contains @
  for (const item of string) {
    if (item.includes('@')) {
      for (let i = 0; i < item.length; i++) {
        if (item[i] === '@') {
          res = item.slice(i);
          break;
        }
      }
      array.push(res);
    }
  }
  // Finds all handles in the filtered array
  for (const obj of array) {
    const temp = obj.split('@');
    for (const obj of temp) {
      if (obj !== '' && !array2.includes(obj)) {
        array2.push(obj);
      }
    }
  }
  return array2;
}

export function tagNotifCh(authUserId: number, message: string, channelId: number) {
  const data = getData();
  const handles: string[] = tagChecker(message);
  const channel = data.channels.find(channel => channel.channelId === channelId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (channel.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: taggerHandle + ' tagged you in ' + channel.name + ': ' + message.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function tagNotifDm(authUserId: number, message: string, dmId: number) {
  const data = getData();
  const handles: string[] = tagChecker(message);
  const dm = data.dms.find(dm => dm.dmId === dmId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (dm.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: taggerHandle + ' tagged you in ' + dm.name + ': ' + message.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function chInviteNotif(authUserId: number, channelId:number, uId: number) {
  const data = getData();
  let inviterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      inviterHandle = user.handleStr;
    }
  }
  const channel = data.channels.find(channel => channel.channelId === channelId);
  for (const user of data.users) {
    if (user.userId === uId) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: inviterHandle + ' added you to ' + channel.name
      };
      user.notifications.push(notifObj);
      setData(data);
      break;
    }
  }
}

export function dmInviteNotif(authUserId: number, dmId:number, uId: number) {
  const data = getData();
  let inviterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      inviterHandle = user.handleStr;
    }
  }
  const dm = data.dms.find(dm => dm.dmId === dmId);
  for (const user of data.users) {
    if (user.userId === uId) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: inviterHandle + ' added you to ' + dm.name
      };
      user.notifications.push(notifObj);
      setData(data);
      break;
    }
  }
}

export function reactNotifCh(authUserId: number, messageId: number) {
  const data = getData();
  let reacterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      reacterHandle = user.handleStr;
    }
  }
  const message = data.messages.find(message => message.messageId === messageId);
  for (const sender of data.users) {
    if (sender.userId === message.uId) {
      // If message is from a channel
      if (message.channelId !== undefined) {
        const channel = data.channels.find(channel => channel.channelId === message.channelId);
        const notifObj = {
          channelId: message.channelId,
          dmId: -1,
          notificationMessage: reacterHandle + ' reacted to your message in ' + channel.name
        };
        sender.notifications.push(notifObj);
        setData(data);
      }
      // If message is from a DM
      if (message.dmId !== undefined) {
        const dm = data.dms.find(dm => dm.dmId === message.dmId);
        const notifObj = {
          channelId: -1,
          dmId: message.dmId,
          notificationMessage: reacterHandle + ' reacted to your message in ' + dm.name
        };
        sender.notifications.push(notifObj);
        setData(data);
      }
    }
  }
}

function excludeRepeatHandle(handleArr1: string[], handleArr2: string[]) {
  const returnArr: string[] = [];
  let array1: string[] = [];
  let array2: string[] = [];
  if (handleArr1.length > handleArr2.length) {
    array1 = handleArr1;
    array2 = handleArr2;
  } else {
    array1 = handleArr2;
    array2 = handleArr1;
  }
  for (const str1 of array1) {
    if (!array2.includes(str1)) {
      returnArr.push(str1);
    }
  }
  console.log('Here ', returnArr);
  return returnArr;
}

export function tagNotifChEdit(authUserId: number, message1: string, message2: string, channelId: number) {
  const data = getData();
  const handles: string[] = excludeRepeatHandle(tagChecker(message1), tagChecker(message2));
  const channel = data.channels.find(channel => channel.channelId === channelId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (channel.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: taggerHandle + ' tagged you in ' + channel.name + ': ' + message2.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function tagNotifDmEdit(authUserId: number, message1: string, message2: string, dmId: number) {
  const data = getData();
  const handles: string[] = excludeRepeatHandle(tagChecker(message1), tagChecker(message2));
  const dm = data.dms.find(dm => dm.dmId === dmId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (dm.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: taggerHandle + ' tagged you in ' + dm.name + ': ' + message2.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}
=======
import { getData, setData } from './dataStore';

/*
Takes in a message and returns an array of string that contains all handles tagged in the message
*/
function tagChecker(message: string) {
  const string: string[] = message.split(' ');
  const array: string[] = [];
  const array2: string[] = [];
  let res = '';
  // Filters out words that contains @
  for (const item of string) {
    if (item.includes('@')) {
      for (let i = 0; i < item.length; i++) {
        if (item[i] === '@') {
          res = item.slice(i);
          break;
        }
      }
      array.push(res);
    }
  }
  // Finds all handles in the filtered array
  for (const obj of array) {
    const temp = obj.split('@');
    for (const obj of temp) {
      if (obj !== '' && !array2.includes(obj)) {
        array2.push(obj);
      }
    }
  }
  return array2;
}

export function tagNotifCh(authUserId: number, message: string, channelId: number) {
  const data = getData();
  const handles: string[] = tagChecker(message);
  const channel = data.channels.find(channel => channel.channelId === channelId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (channel.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: taggerHandle + ' tagged you in ' + channel.name + ': ' + message.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function tagNotifDm(authUserId: number, message: string, dmId: number) {
  const data = getData();
  const handles: string[] = tagChecker(message);
  const dm = data.dms.find(dm => dm.dmId === dmId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (dm.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: taggerHandle + ' tagged you in ' + dm.name + ': ' + message.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function chInviteNotif(authUserId: number, channelId:number, uId: number) {
  const data = getData();
  let inviterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      inviterHandle = user.handleStr;
    }
  }
  const channel = data.channels.find(channel => channel.channelId === channelId);
  for (const user of data.users) {
    if (user.userId === uId) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: inviterHandle + ' added you to ' + channel.name
      };
      user.notifications.push(notifObj);
      setData(data);
      break;
    }
  }
}

export function dmInviteNotif(authUserId: number, dmId:number, uId: number) {
  const data = getData();
  let inviterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      inviterHandle = user.handleStr;
    }
  }
  const dm = data.dms.find(dm => dm.dmId === dmId);
  for (const user of data.users) {
    if (user.userId === uId) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: inviterHandle + ' added you to ' + dm.name
      };
      user.notifications.push(notifObj);
      setData(data);
      break;
    }
  }
}

export function reactNotifCh(authUserId: number, messageId: number) {
  const data = getData();
  let reacterHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      reacterHandle = user.handleStr;
    }
  }
  const message = data.messages.find(message => message.messageId === messageId);
  for (const sender of data.users) {
    if (sender.userId === message.uId) {
      // If message is from a channel
      if (message.channelId !== undefined) {
        const channel = data.channels.find(channel => channel.channelId === message.channelId);
        const notifObj = {
          channelId: message.channelId,
          dmId: -1,
          notificationMessage: reacterHandle + ' reacted to your message in ' + channel.name
        };
        sender.notifications.push(notifObj);
        setData(data);
      }
      // If message is from a DM
      if (message.dmId !== undefined) {
        const dm = data.dms.find(dm => dm.dmId === message.dmId);
        const notifObj = {
          channelId: -1,
          dmId: message.dmId,
          notificationMessage: reacterHandle + ' reacted to your message in ' + dm.name
        };
        sender.notifications.push(notifObj);
        setData(data);
      }
    }
  }
}

function excludeRepeatHandle(handleArr1: string[], handleArr2: string[]) {
  const returnArr: string[] = [];
  let array1: string[] = [];
  let array2: string[] = [];
  if (handleArr1.length > handleArr2.length) {
    array1 = handleArr1;
    array2 = handleArr2;
  } else {
    array1 = handleArr2;
    array2 = handleArr1;
  }
  for (const str1 of array1) {
    if (!array2.includes(str1)) {
      returnArr.push(str1);
    }
  }
  console.log('Here ', returnArr);
  return returnArr;
}

export function tagNotifChEdit(authUserId: number, message1: string, message2: string, channelId: number) {
  const data = getData();
  const handles: string[] = excludeRepeatHandle(tagChecker(message1), tagChecker(message2));
  const channel = data.channels.find(channel => channel.channelId === channelId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (channel.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: taggerHandle + ' tagged you in ' + channel.name + ': ' + message2.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}

export function tagNotifDmEdit(authUserId: number, message1: string, message2: string, dmId: number) {
  const data = getData();
  const handles: string[] = excludeRepeatHandle(tagChecker(message1), tagChecker(message2));
  const dm = data.dms.find(dm => dm.dmId === dmId);
  let taggerHandle = '';
  for (const user of data.users) {
    if (user.userId === authUserId) {
      taggerHandle = user.handleStr;
    }
  }
  for (const handle of handles) {
    // Find user that matches the handle
    const user = data.users.find(user => user.handleStr === handle);
    // Find user in channel members
    if (dm.members.some(member => member.uId === user.userId)) {
      const notifObj = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: taggerHandle + ' tagged you in ' + dm.name + ': ' + message2.substring(0, 20)
      };
      user.notifications.push(notifObj);
      setData(data);
    }
  }
}
>>>>>>> 29264aebc3802f3f5da6a9e79b3e22430f7cd2f7
