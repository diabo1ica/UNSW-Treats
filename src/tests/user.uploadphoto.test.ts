import { requestRegister, requestLogin, requestClear, requestUploadPhoto } from './request';
import { INPUT_ERROR } from './request';

describe('users path tests', () => {
  let token : string;
  let userID : number;
  let imgUrl : string = 'https://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.jpg';
  let imgUrlWrong : string = 'https://www.traveller.com.au/content/dam/images/h/1/p/q/1/k/image.related.articleLeadwide.620x349.h1pq27.png/1596176460724.png'
  beforeEach(() => {
    requestClear();
    requestRegister('Alalalyeehoo@gmail.com', 'Sk8terboiyo', 'Jingisu', 'Kan');
    const obj = requestLogin('Alalalyeehoo@gmail.com', 'Sk8terboiyo');
    token = obj.body.token;
    userID = obj.body.authUserId;
  }); 

  test('UserUploadPhoto Unsuccessfull', () => {
    expect(requestUploadPhoto(token, imgUrl, 100, 0, 0, 100).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('UserUploadPhoto Unsuccessfull', () => {
    expect(requestUploadPhoto(token, imgUrlWrong, 0, 100, 0, 100).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('UserUploadPhoto Unsuccessfull', () => {
    expect(requestUploadPhoto(token, imgUrl, -1, 100, 0, 100).statusCode).toStrictEqual(INPUT_ERROR);
  });

  test('UserUploadPhoto Unsuccessfull', () => {
    expect(requestUploadPhoto(token, imgUrl, 0, 100, 0, 100).statusCode).toStrictEqual(INPUT_ERROR);
  });
});