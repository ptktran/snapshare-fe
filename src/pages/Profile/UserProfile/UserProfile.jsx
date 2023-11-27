import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import ErrorPage from "../../Error/ErrorPage"
import { useAuth, supabase} from "../../../auth/Auth"
import { useNavigate } from "react-router-dom"
import Modal from "../../../components/Modal/Modal"
import Loader from "../../../components/Loader/Loader"

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [userData, setUserData] = useState({})
  const [userPosts, setUserPosts] = useState({})
  const [msg, setMsg] = useState()
  const [errorCode, setErrorCode] = useState()
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowings, setShowFollowings] = useState(false)
  const [loading, setLoading] = useState(true)

  const [following, setFollowing] = useState(false)
  const [followText, setFollowText] = useState("Follow")
  const [followColour, setFollowColour] = useState("");
  const [hoverColour, setHoverColour] = useState("");
  const [numberOfPosts, setNumberOfPosts] = useState(0)
  const [followers, setFollowers] = useState([])
  const [followings, setFollowings] = useState([])

  // fetch user data and check if account is owned by user
  useEffect(() => {
    let isMounted = true
    const fetchUser = async (username) => {
      try {
        await fetch(`http://localhost:3000/getUserInfo/${username}`)
        .then(response => {
          return response.json()
        }).then(data => {
          if (data.status === 200) {
            setUserData(data.data[0])
            fetchUserPosts(username)
            setLoading(false)
          } else {
            setErrorCode(data.status)
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser(username)

    return () => {
      isMounted = false;
    }
  }, [username])

  useEffect(() => {
    isFollowing();
    fetchFollowers();
    fetchFollowings();
  }, [following, userData])
  
  const fetchUserPosts = async (username) => {
    try {
      await fetch(`http://localhost:3000/getUserPosts/${username}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUserPosts(data.data)
          setNumberOfPosts(data.data.length)
        } else if (data.status === 400) {
          setMsg("No Posts Yet")
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const isFollowing = async () => {
    if (userData && userData.user_id) {
      const { data, error } = await supabase
      .from('followers')
      .select()
      .eq('follower_id', user.id)
      .eq('following_id', userData.user_id)
  
      if (data !== null && data.length !== 0) {
        setFollowing(true);
        setFollowText("Following");
        setFollowColour("bg-gray");
        setHoverColour("bg-accent");
      }
      else {
        setFollowing(false);
        setFollowText("Follow");
        setFollowColour("bg-blue-500");
        setHoverColour("bg-blue-600");
      }
  
      if (error) {
        console.log(error);
      }
    }
  }

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/getUsernameInfo/${userId}`);
      const data = await response.json();
  
      if (data.status === 200) {
        return data.data[0]
      } else if (data.status === 404) {
        console.log("Info unavailable");
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  const fetchFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', userData.user_id)
  
      if (data) {
        const followerIds = data.map((follower) => follower.follower_id)
        const userDataPromises = followerIds.map((followerId) => fetchUserData(followerId))
        const userDataList = await Promise.all(userDataPromises)
        setFollowers(userDataList.filter(Boolean))
        // setNumberOfFollowers(data.length)
      }
  
      if (error) {
        console.log(error)
      }
    } catch (error) {
      console.error('Error fetching followers:', error)
    }
  };
  
  const fetchFollowings = async () => {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userData.user_id);
  
      if (data) {
        const followingIds = data.map((following) => following.following_id)
        const userDataPromises = followingIds.map((followingId) => fetchUserData(followingId))
        const userDataList = await Promise.all(userDataPromises)
        setFollowings(userDataList.filter(Boolean)) // Filter out null values
        // setNumberOfFollowing(data.length)
      }
  
      if (error) {
        console.log(error)
      }
    } catch (error) {
      console.error('Error fetching followings:', error)
    }
  };  

  const handleFollow = async () => {
    if (following === true ){
      const {error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userData.user_id)
      .select()

      if (error) {
        console.log(error)
      }

      setFollowText("Follow")
      setFollowing(false)
      setFollowColour("bg-blue-500")
      setHoverColour("bg-blue-600")

    }
    else {
      const {error } = await supabase
      .from('followers')
      .insert([{follower_id: user.id, following_id: userData.user_id }])
      .select()

      if (error) {
        console.log(error)
      }

      setFollowText("Following")
      setFollowing(true)
      setHoverColour("bg-accent")
      setFollowColour("bg-gray")
    }
  }

  function isImage(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    if (imageExtensions.test(url)) return true
    return false
  }

  // if no post is found return error page, if loading return loading page
  if (errorCode) {
    return <ErrorPage errorCode={errorCode} />
  } else if (loading) {
    return <Loader />
  }

  return (
    <>
      <main className="ml-0 md:ml-64 px-2 md:px-0">
        {/* header with user name and user info */}
        <header className="w-full md:w-[800px] border-b border-gray m-auto flex flex-col md:flex-row justify-center gap-3 py-5 md:gap-20 md:p-5">
          <div className="p-0 md:p-5 w-full md:w-fit flex items-center">
            {userData.profile_picture_url ? (
              <div className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden">
                <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
              </div>
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                className="rounded-full w-[70px] md:w-[150px]" />
            )}
          </div>
          <section className="w-full md:w-[450px] flex flex-col gap-4 md:gap-5 py-0 md:py-5">
            <div className="flex flex-wrap justify-normal items-center gap-3 md:gap-8">
              <h1 className="font-medium text-xl">{userData.username}</h1>
              <div className="flex items-center gap-4">
                {userData.user_id === user.id ? (
                  <Link to="/profile" className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-accent ease duration-150">Edit Profile</Link>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`${followColour} hover:${hoverColour} px-5 py-1.5 rounded-lg text-sm font-medium duration-150 ease`}>{followText}
                    </button>
                    {following && (
                      <Link to="/direct-message" className="bg-blue-500 px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 ease duration-150">Message</Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-10">
              <h1 className="text-sm md:text-base"><b>{numberOfPosts}</b> posts</h1>
              <button onClick={() => setShowFollowers(true)} className="hover:text-foreground/80 ease duration-150 text-sm md:text-base"><b>{followers ? followers.length : 0}</b> followers</button>
              <button onClick={() => setShowFollowings(true)} className="hover:text-foreground/80 ease duration-150 text-sm md:text-base"><b>{followings ? followings.length : 0}</b> following</button>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-sm md:text-base">{userData.user_bio}</h1>
              <a href={userData.website} target="blank"
                className="font-medium text-accent hover:underline w-fit text-sm md:text-base"
                >{userData.website}</a>
            </div>
          </section>
        </header>
        
        {/* rendering user posts */}
        <section className="flex flex-wrap justify-start pt-4 pb-8 gap-4 w-full md:w-[800px] m-auto">
          {userPosts.length >= 1 ? userPosts.map((post, index) => (
            <Link to={`/post/${post.post_id}`} key={index} className="w-[130px] h-[130px] md:w-64 md:h-64 relative group overflow-hidden">
              {post.file_url && post.file_url[0] ? (
                isImage(post.file_url[0]) ? (
                  <img src={post.file_url[0]} className="w-full h-full object-cover" alt="Post Thumbnail" />
                ) : (
                  <video src={post.file_url[0]} className="w-full h-full object-cover" alt="Post Thumbnail" />
                )
              ) : (
                <p>No media available</p>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 duration-100 transition-opacity flex items-center justify-center"/>
            </Link>
          )) : (
            <h1 className="m-auto text-lg text-neutral-600 py-5">{msg}</h1>
          )}
        </section>
      </main>
      <Modal title={"Followers"} isVisible={showFollowers} onClose={() => setShowFollowers(false)}>
        <div className="pt-2">
          {followers && followers.map((follower, index) => (
            <Link key={index} to={`/${follower.username}`} onClick={() => setShowFollowers(false)} className="py-2.5 px-4 flex items-center gap-2 hover:bg-lightgray ease duration-150">
              {follower.profile_picture_url ? (
              <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                <img src={follower.profile_picture_url} className="w-full h-full object-cover"/>
              </div>
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                className="rounded-full w-[40px]" />
            )}
              <div className="flex flex-col">
                <h1 className="font-semibold text-sm leading-tight">{follower.username}</h1>
                <h1 className="font-light text-sm leading-tight">{follower.user_bio}</h1>
              </div>
            </Link>
          ))}
        </div>
      </Modal>

      <Modal title={"Following"} isVisible={showFollowings} onClose={() => setShowFollowings(false)}>
        <div className="pt-2">
          {followings && followings.map((following, index) => (
            <Link key={index} to={`/${following.username}`} onClick={() => setShowFollowings(false)} className="py-2.5 px-4 flex items-center gap-2 hover:bg-lightgray ease duration-150">
              {following.profile_picture_url ? (
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                  <img src={following.profile_picture_url} className="w-full h-full object-cover"/>
                </div>
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                  className="rounded-full w-[40px]" />
              )}
              <div className="flex flex-col">
                <h1 className="font-semibold text-sm leading-tight">{following.username}</h1>
                <h1 className="font-light text-sm leading-tight">{following.user_bio}</h1>
              </div>
            </Link>
          ))}
        </div>
      </Modal>
    </>
  )
}