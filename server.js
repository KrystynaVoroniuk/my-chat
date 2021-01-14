const express = require('express');
const app = express(); //экспресс приложение для запросов

const server = require('http').Server(app); //наш сервер работает по экспрессу
const io = require('socket.io')(server,{cors:{origin:"*"}}); // подключение сокетов к серверу


app.use(express.json());
const rooms = new Map();


app.get('/rooms/:id', (req, res) => {
    const { id: roomId } = req.params;
    const obj = rooms.has(roomId)
      ? {
          users: [...rooms.get(roomId).get('users').values()],
          messages: [...rooms.get(roomId).get('messages').values()],
        }
      : { users: [], messages: [] };
    res.json(obj);
  });
  
  app.post('/rooms', (req, res) => {
    const { roomId, userName } = req.body;
    if (!rooms.has(roomId)) {
      rooms.set(
        roomId,
        new Map([
          ['users', new Map()],
          ['messages', []],
        ]),
      );
    }
    res.send();
  }); //если у нас есть команата, то мы создаем отдельную комнату, у котой есть список пользователей(которых можно удалять) и список их смс
  
io.on('connection', (socket) =>{
    socket.on('ROOM:JOIN', ({roomId, userName}) =>{
        socket.join(roomId); //сокет подключает к конкретной комнате
        rooms.get(roomId).get('users').set(socket.id, userName); //в определенной части комнаты, мы находим колекцию пользователей и в бд сохраняем пользователя по id socket
        const users = [...rooms.get(roomId).get('users').values()]; //получаем имена всех пользователей
        socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users); //говорим юзерам в конкретной комнате, о том, что новый юзер присоеденился, broadcast это присылает для всех кроме этого нового юзера
    });
    
    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = {
          userName,
          text,
        };
        rooms.get(roomId).get('messages').push(obj);
        socket.to(roomId).broadcast.emit('ROOM:NEW_MESSAGE', obj);
      });
    
      socket.on('disconnect', () => {
        rooms.forEach((value, roomId) => {
          if (value.get('users').delete(socket.id)) {
            const users = [...value.get('users').values()];
            socket.to(roomId).broadcast.emit('ROOM:SET_USERS', users);
          }
        });
      });
    
    console.log('user connected', socket.id);
} //оповещение о том, что пользователь подкл
);


server.listen(9999, (err) => {
    if(err){
        throw Error(err);
    }
    console.log('Сервер запущен!');
})