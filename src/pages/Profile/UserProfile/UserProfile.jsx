import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import ErrorPage from "../../Error/ErrorPage"
import { useAuth } from "../../../auth/Auth"
import { useNavigate } from "react-router-dom"
import Loader from "../../../components/Loader/Loader"

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [userData, setUserData] = useState({})
  const [userPosts, setUserPosts] = useState({})
  const [msg, setMsg] = useState()
  const [errorCode, setErrorCode] = useState()
  const [ownAccount, setOwnAccount] = useState(false)
  const [loading, setLoading] = useState(true)

  // fetch user data and check if account is owned by user
  useEffect(() => {
    const fetchUser = async (username) => {
      try {
        await fetch(`http://localhost:3000/getUserInfo/${username}`)
        .then(response => {
          return response.json()
        }).then(data => {
          if (data.status === 200) {
            if (data.data[0].user_id === user.id) {
              setOwnAccount(true)
            }
            setUserData(data.data[0])
            fetchUserPosts(username)
            setLoading(false)
          } else if (data.status === 404) {
            setErrorCode(data.status)
          }
        })
      } catch (error) {
        console.log(error)
      }
    }

    fetchUser(username)
  }, [])
  
  const fetchUserPosts = async (username) => {
    try {
      await fetch(`http://localhost:3000/getUserPosts/${username}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUserPosts(data.data)
        } else if (data.status === 400) {
          setMsg("No Posts Yet")
        }
      })
    } catch (error) {
      console.log(error)
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
      <main className="ml-0 md:ml-64">
        {/* header with user name and user info */}
        <header className="w-full md:w-[800px] border-b border-gray m-auto flex justify-center gap-20 p-5">
          <div className="p-5">
            {userData.profile_picture_url ? (
              <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
              </div>
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                className="rounded-full w-[150px]" />
            )}
          </div>
          <section className="w-full md:w-[450px] flex flex-col gap-5 py-5">
            <div className="flex items-center gap-8">
              <h1 className="font-medium text-xl">{userData.username}</h1>
              <div className="flex items-center gap-4">
                {ownAccount ? (
                  <Link to="/profile" className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-accent ease duration-150">Edit Profile</Link>
                ) : (
                  <>
                    <button className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-accent ease duration-150">Follow</button>
                    <button className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray/80 ease duration-150">Message</button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-10">
              <h1><b>5</b> posts</h1>
              <h1><b>20</b> followers</h1>
              <h1><b>30</b> following</h1>
            </div>
            <div className="flex flex-col gap-2">
              <h1>{userData.user_bio}</h1>
              <a href={userData.website} target="blank"
                className="font-medium text-accent hover:underline w-fit"
                >{userData.website}</a>
            </div>
          </section>
        </header>
        
        {/* rendering user posts */}
        <section className="flex flex-wrap justify-start py-4 gap-4 w-[800px] m-auto">
          {userPosts.length >= 1 ? userPosts.map((post, index) => (
            <Link to={`/post/${post.post_id}`} key={index} className="w-64 h-64 relative group overflow-hidden">
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
    </>
  )
}