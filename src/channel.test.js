import { channelDetailsV1 } from './channel';

test('Valid Channel Details',() => {
  expect(channelDetailsV1(1, 1)).toStrictEqual({
    name: 'secret candy crush team', 
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };);
}

test('Invalid authId and channelId',() => {
  expect(channelDetailsV1(2, 2)).toStrictEqual({error: 'error'});
}

test('Invalid channelId',() => {
  expect(channelDetailsV1(1, 2)).toStrictEqual({error: 'error'});
}

test('Valid channelId but invalid authId',() => {
  expect(channelDetailsV1(2, 1)).toStrictEqual({error: 'error'});
}
