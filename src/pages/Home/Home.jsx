import Navbar from "../../components/Navbar/Navbar";
import { useAuth, supabase } from "../../auth/Auth";
import Login from "../Login/Login";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  const { user } = useAuth() 
  const [userData, setUserData] = useState([])
  useEffect(() => {
    fetchUserProfile()
  }, [])
  
  // Gets the user profile 
  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('users123')
      .select()
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    if (data.length > 0) {
      const user = data[0];
      setUserData({
        username: user.username,
        user_bio: user.user_bio,
        user_profile: user.profile_picture_url || '',
        user_website: user.website || '',
      })
    } else {
      toast(<Link to="/profile">Create your profile to get started!</Link>, { icon: '👋', duration: 3000, id: "signup" })
    }
  };
  return (
    <>
      <main className="ml-0 md:ml-64">
        <h1>No posts to show</h1>
      </main>
      <Toaster />
    </>
  )
}