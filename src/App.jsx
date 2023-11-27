import Home from './pages/Home/Home'
import { useAuth } from './auth/Auth'
import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from './components/Navbar/Navbar'
import CreatePost from './pages/Create/CreatePost/CreatePost'
import Content from './pages/Profile/Content/Content'
import Settings from './pages/Profile/Settings/Settings'
import YourActivity from './pages/Profile/Settings/Activity'
import Login from './pages/Login/Login'
import Search from './pages/Search/Search'
import PrivateRoute from './routes/PrivateRoute'
import UserProfile from './pages/Profile/UserProfile/UserProfile'
import PostPage from './pages/Post/PostPage'
import ErrorPage from './pages/Error/ErrorPage'
import DirectMessage from './pages/DirectMessage/DirectMessage'
import Notification from './pages/Notification/notifications'
import Form from './pages/Feedback/Form'
import Hashtag from './pages/Search/Hashtag'

function App() {
  const { user } = useAuth()
  return (
    <>
      <Routes>
        <Route element={user ? <Navbar /> : <Login/>}>
          <Route path="/" element={<PrivateRoute user={user}><Home /></PrivateRoute>} />
          <Route path="/create-post" element={<PrivateRoute user={user}><CreatePost /></PrivateRoute>} /> 
          <Route path="/profile" element={<PrivateRoute user={user}><Content /></PrivateRoute>} />
          <Route path="/:username" element={<PrivateRoute user={user}><UserProfile /></PrivateRoute>} />
          <Route path="/post/:postId" element={<PrivateRoute user={user}><PostPage /></PrivateRoute>} />
          <Route path="/hashtag/:hashtag" element={<PrivateRoute user={user}><Hashtag /></PrivateRoute>} />
          <Route path="/direct-message" element={<PrivateRoute user={user}><DirectMessage /></PrivateRoute>}/>
          <Route path="/notifications" element={<PrivateRoute user={user}><Notification /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute user={user}><Settings /></PrivateRoute>} />
          <Route path="/youractivity" element={<PrivateRoute user={user}><YourActivity /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute user={user}><Search /></PrivateRoute>} />
          <Route path="/Form" element={<PrivateRoute user={user}><Form /></PrivateRoute>} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
