import Home from './pages/Home/Home'
import { useAuth } from './auth/Auth'
import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from './components/Navbar/Navbar'
import CreatePost from './pages/Create/CreatePost/CreatePost'
import Content from './pages/Profile/Content/Content'
import Settings from './pages/Profile/Settings/Settings'
import Login from './pages/Login/Login'
import Search from './pages/Search/Search'
import PrivateRoute from './routes/PrivateRoute'

function App() {
  const { user } = useAuth()
  return (
    <>
      <Routes>
        <Route element={user ? <Navbar /> : <Login/>}>
          <Route path="/" element={<PrivateRoute user={user}><Home /></PrivateRoute>} />
          <Route path="/create-post" element={<PrivateRoute user={user}><CreatePost /></PrivateRoute>} /> 
          <Route path="/profile" element={<PrivateRoute user={user}><Content /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute user={user}><Search /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
