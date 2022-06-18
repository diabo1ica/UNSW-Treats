function authRegisterV1(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  }
}

function authloginV1(email, password) {
  return {
    authUserId: 1,
  }
}

export { authloginV1, authRegisterV1 };
