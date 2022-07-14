import { getData, setData, dataStr, dm, dmMember } from './dataStore';

function dmCreate(creatorId: number, uIds: number[]) {
  const data: dataStr = getData();
  if (!uIds.every((uId) => validateUserId(uId)) || isDuplicateUserId(uIds) === true) {
    throw new Error('error');
  }

  const newDm: dm = dmTemplate();
  newDm.creatorId = creatorId;
  newDm.dmId = generatedmId();

  uIds.forEach((uId) => {
    const newMember = dmMemberTemplate();
    newMember.dmPermsId = 2;
    newMember.uId = uId;
    newDm.members.push(newMember);
  });

  const creator = dmMemberTemplate();
  creator.dmPermsId = 1;
  creator.uId = creatorId;
  newDm.members.push(creator);
  const sortedArray: string[] = [];
  for (const item of data.users) {
    if (newDm.members.some((member) => member.uId === item.userId)) sortedArray.push(item.handleStr);
  }
  sortedArray.sort();
  for (const item of sortedArray) {
    if (sortedArray.indexOf(item) === sortedArray.length - 1) {
      newDm.name += item;
    } else {
      newDm.name += item + ', ';
    }
  }
  data.dms.push(newDm);
  setData(data);
  return {
    dmId: newDm.dmId
  };
}
const dmTemplate = (): dm => {
  return {
    members: [],
    messages: [],
    dmId: 0,
    creatorId: 0,
    name: '',
  };
};

const dmMemberTemplate = (): dmMember => {
  return {
    uId: 0,
    dmPermsId: 0,
  };
};

const validateUserId = (UserId: number) => {
  const data: dataStr = getData();
  if (data.users.some((user) => user.userId === UserId)) return true;
  return false;
};

const isDuplicateUserId = (userIds: number[]) => {
  for (const item of userIds) {
    if (userIds.filter((uId) => uId === item).length !== 1) {
      return true;
    }
  }
  return false;
};

function generatedmId() {
  const data = getData();
  let dmId: number;
  if (data.dmIdCounter === 0) dmId = 1;
  else dmId = data.dmIdCounter + 1;
  data.dmIdCounter++;
  setData(data);
  return dmId;
}
export { dmCreate };
