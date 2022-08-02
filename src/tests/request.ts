import { IncomingHttpHeaders } from 'http';
import request, { HttpVerb } from 'sync-request';
import config from '../config.json';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || config.url;
const SERVER_URL = `${HOST}:${PORT}`;
export const OK = 200;
export const INPUT_ERROR = 400;
export const AUTHORISATION_ERROR = 403;

export const generateMessage = (length: number): string => {
  let message = '';
  for (let i = 0; i < length; i++) {
    message += String.fromCharCode(Math.floor(Math.random() * 26) % 26 + 97);
  }
  return message;
};

export const sendMessages = (token: string, dmId: number, numberOfMessages: number, length: number) => {
  for (let i = 0; i < numberOfMessages; i++) {
    requestSendDm(token, dmId, generateMessage(length));
  }
};

export const requestClear = () => {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
  if (res.statusCode !== OK) return { error: 'error' };
  return { statusCode: res.statusCode, body: JSON.parse(res.getBody() as string) };
};

export const requestRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/auth/register/v3', { email: email, password: password, nameFirst: nameFirst, nameLast: nameLast });
};

export const requestLogin = (email: string, password: string) => {
  return requestHelper('POST', '/auth/login/v3', { email: email, password: password });
};

export const requestLogout = (token: string) => {
  return requestHelper('POST', '/auth/logout/v2', { token: token });
};

export const requestChannelDetails = (token: string, chId: number) => {
  return requestHelper('GET', '/channel/details/v3', { token: token, channelId: chId });
};

export const requestChannelLeave = (token: string, channelId: number) => {
  return requestHelper('POST', '/channel/leave/v2', { token: token, channelId: channelId });
};

export const requestChannelslistall = (token: string) => {
  return requestHelper('GET', '/channels/listall/v3', { token: token });
};

export const requestChannelInvite = (token: string, channelId: number, uId: number) => {
  return requestHelper('POST', '/channel/invite/v2', { token: token, channelId: channelId, uId: uId });
};

export const requestChannelMessages = (token: string, channelId: number, start: number) => {
  return requestHelper('GET', '/channel/messages/v3', { token: token, channelId: channelId, start: start });
};

export const requestDmCreate = (token: string, uIds: number[]) => {
  return requestHelper('POST', '/dm/create/v2', { token: token, uIds: uIds });
};

export const requestDmRemove = (token: string, dmId: number) => {
  return requestHelper('DELETE', '/dm/remove/v2', { token: token, dmId: dmId });
};

export const requestDmList = (token: string) => {
  return requestHelper('GET', '/dm/list/v2', { token: token });
};

export const requestSendDm = (token: string, dmId: number, message: string) => {
  return requestHelper('POST', '/message/senddm/v2', { token: token, dmId: dmId, message: message });
};

export const requestDmLeave = (token: string, dmId: number) => {
  return requestHelper('POST', '/dm/leave/v2', { token: token, dmId: dmId });
};

export const requestDmMessages = (token: string, dmId: number, start: number) => {
  return requestHelper('GET', '/dm/messages/v2', { token: token, dmId: dmId, start: start });
};

export const requestDmDetails = (token: string, dmId: number) => {
  return requestHelper('GET', '/dm/details/v2', { token: token, dmId: dmId });
};

export const requestChannelsCreate = (token: string, name: string, isPublic: boolean) => {
  return requestHelper('POST', '/channels/create/v2', { token: token, name: name, isPublic: isPublic });
};


export const requestResetReq= (token: string, email: string) => {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { token: token, email: email});
};

export const requestResetPassword = (resetCode: string, newPassword: string) => {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', { resetCode: resetCode, newPassword: newPassword});
}

export const requestMessagePin = (token: string, messageId: number) => {
  return requestHelper('POST', '/message/pin/v1', { token: token, messageId: messageId });
};

export const requestMessageReact = (token: string, messageId: number, reactId: number) => {
  return requestHelper('POST', '/message/react/v1', { token: token, messageId: messageId, reactId: reactId });
};

export const requestStartStandUp = (token: string, channelId: number, length: number) => {
  return requestHelper('POST', '/standup/start/v1', { token: token, channelId: channelId, length: length });
};

export const requestSendLaterDm = (token: string, dmId: number, message: string, timeSent: number) => {
  return requestHelper('POST', '/message/sendlaterdm/v1', { token: token, dmId: dmId, message: message, timeSent: timeSent });
};

export const requestSendChannelMessage = (token: string, channelId: number, message: string) => {
  return requestHelper('POST', '/message/send/v2', { token: token, channelId: channelId, message: message });
};

export const requestJoinChannel = (token: string, channelId: number) => {
  return requestHelper('POST', '/channel/join/v3', { token: token, channelId: channelId });
};

const requestHelper = (method: HttpVerb, route: string, payload: any) => {
  let qs = {};
  let json = {};
  const headers: IncomingHttpHeaders = {};
  if (payload.token !== undefined) headers.token = payload.token;
  payload = JSON.parse(JSON.stringify(payload));
  delete payload.token;
  if (['GET', 'DELETE'].includes(method)) qs = payload;
  else json = payload;
  const res = request(method, SERVER_URL + route, { headers: headers, qs: qs, json: json });
  return { statusCode: res.statusCode, body: JSON.parse(res.body as string) };
};
