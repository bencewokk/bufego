import { useState } from 'react';
import './App.css'
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  axios.get('http://localhost:3000/').then((res) => {setMessage(res.data)})
  return (
    <>
      <div>teszt</div>
      <div>Backend teszt: {message}</div>
    </>
  )
}

export default App
