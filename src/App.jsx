import { useState, useEffect } from 'react'
import Login from './pages/Login/Login'
import { useAuth } from './auth/Auth'

function App() {
  const { signUp, signIn, signOut, user } = useAuth()  
  if (!user) {
    return(<Login />)
  }
    else {
      console.log(user)
      return (
        <div>
          Logged in! Hello {user.email}
          <button onClick={signOut}>Sign Out</button>
        </div>
      )
  }
}

export default App
