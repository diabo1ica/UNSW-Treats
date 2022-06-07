```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design
```

// the list of users.
users [
    {
      'email': 'kennethkuo25@outlook.com',
      'password': 'Aero123',
      'nameFirst': 'Kenneth',
      'nameLast': 'Kuo',
      'name': 'master',
      'uId': 1,
    },
    
    {
      'email': 'garyang123@yahoo.com',
      'password': 'GodDammIt',
      'nameFirst': 'Gary',
      'nameLast': 'Ang',
      'name': 'master',
      'uId': 2,
    },
    
    {
      'email': 'steve1531@gmail.com',
      'password': 'UnswTheBest',
      'nameFirst': 'Steve',
      'nameLast': 'Berrospi',
      'name': 'master',
      'uId': 3,
    },   
]

// the list of channel.
channel [
    {
      users, //users list in the channel
      'authUserId': 123,
      'name': 'AeroFirst',
      'isPublic': true, //true or false
      'channelId': 345,
      'start': 10,  
      'message': 'Finish it before deadline!',   
    },
    
    {
      users, //users list in the channel
      'authUserId': 676,
      'name': 'AeroSecond',
      'isPublic': false, //true or false
      'channelId': 787,
      'start': 10,    
      'message': 'Help me',
    },
    
]


