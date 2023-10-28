
import { useNavigate } from "react-router-dom"

export default function PrivateRoute({ user, children }) {
  const navigate = useNavigate()  
  if (!user) {
    navigate("/")
  } 
  return children
}