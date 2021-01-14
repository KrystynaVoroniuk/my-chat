import React, { useState } from 'react'
// import socket from '../socket';
import axios from 'axios';




function JoinBlock({onLogin}) {
    const [roomId, setRoomId] = React.useState('');
    const [userName, setUserName] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);

    let onEnter = async() => {
        if (!roomId || !userName) {
            return alert('Неверные данные');
          }
        
        let obj = {
            roomId,
            userName,

        };
        setLoading(true);
        await axios.post('/rooms', obj);
        onLogin(obj);
    }; //нажатие на кнопку вход, авторизован или нет
    return (

        <div className="join-block">
            <input 
            type="text" 
            placeholder="ROOM ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)} />
            <input 
            type="text" 
            placeholder="YOUR NAME" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} />
            <button disabled ={isLoading} onClick={onEnter} className='btn btn-success'>
                {isLoading ? 'ВХОД...' : 'ВОЙТИ'}
            </button>
        </div>

    )
}

export default JoinBlock;