import React, { useReducer } from 'react';
import axios from 'axios';
import socket from './socket';

import reducer from './reducer';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';


function App() {
  const [state, dispatch] = React.useReducer(reducer, {
    joined: false,
    roomId: null,
    userName: null,
    users: [],
    messages: [],
  });

  //пользователь вошел
  const onLogin = async(obj) => {
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    //emit отправляет сокет запрос на бэк
    socket.emit('ROOM:JOIN', obj);
    const { data } = await axios.get(`/rooms/${obj.roomId}`);
    dispatch({
      type: 'SET_DATA',
      payload: data,
    });
  };
   
  const setUsers = (users) => {
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };

  const addMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };

  React.useEffect(() => {
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGE', addMessage);
  }, []); // получаем актуальные данные от сокета про нового юзера

  window.socket = socket;
  

  return (
    <div className="wrapper">
     {!state.joined ? (
        <JoinBlock onLogin={onLogin} />
      ) : (
        <Chat {...state} onAddMessage={addMessage} />
      )} 
    
    </div> 
  );
   //сокрытие блока регистрации, если пользователь вошел
}

export default App;
