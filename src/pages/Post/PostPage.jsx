import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorPage from "../Error/ErrorPage";
import Carousel from "../../components/Carousel/Carousel";
import { getDate } from "../../utils/DateFormatter";
import Loader from "../../components/Loader/Loader";

export default function PostPage() {
  const { postId } = useParams()
  const [postData, setPostData] = useState([])
  const [postImages, setPostImages] = useState([])
  const [username, setUsername] = useState("")
  const [userData, setUserData] = useState([])
  const [errorCode, setErrorCode] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPost(postId)
  },[])
  
  // fetch post and user info from backend
  const fetchUserPost = async (postId) => {
    try {
      await fetch(`http://localhost:3000/getPost/${postId}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setPostData(data.data[0])
          setPostImages(data.data[0].file_url)
          fetchUsername(data.data[0].user_id)
          setLoading(false)
        } else if (data.status === 404) {
          setErrorCode(404)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUsername = async (userId) => {
    try {
      await fetch(`http://localhost:3000/getUsername/${userId}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUsername(data.data[0].username)
          fetchUser(data.data[0].username)
        } else if (data.status === 404) {
          setErrorCode(data.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUser = async (username) => {
    try {
      await fetch(`http://localhost:3000/getUserInfo/${username}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUserData(data.data[0])
        } else if (data.status === 404) {
          setErrorCode(data.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  // if no post is found return error page, if loading return loading page
  if (errorCode) {
    return <ErrorPage errorCode={errorCode} />
  } else if (loading) {
    return <Loader />
  }

  return (
    <>
      <main className="ml-0 md:ml-64 flex justify-center items-start">
        <div className="w-[850px] h-[650px] flex items-center mt-10">
          {/* render image carousel */}
          {postImages ? (
            <Carousel images={postImages} />
          ) : (<h1>An error has occured, please try again later.</h1>)}
          {/* banner with username, profile pic and date */}
          <section className="w-[450px] border border-gray h-full flex flex-col justify-between">
            <Link to={`/${username}`} className="h-[50px] border-b border-gray flex items-center justify-between p-2.5 hover:text-foreground/80 ease duration-150">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray">
                  {userData.profile_picture_url ? (
                    <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" className="w-full h-full object-cover"/>
                  )}
                </div>
                <h1 className="font-semibold text-sm">{username}</h1>
              </div>
              <h1 className="text-xs font-light text-neutral-400">{getDate(postData.updated_at)}</h1>
            </Link>

            {/* rendering caption */}
            <div className="h-full w-full text-sm flex-col items-start justify-start p-2">
              <div className="flex gap-2">
                <Link to={`/${username}`} className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden border border-gray">
                  {userData.profile_picture_url ? (
                    <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" className="w-full h-full object-cover"/>
                  )}
                </Link>
                <div className="leading-none w-full break-words">
                  <Link to={`/${username}`} className="font-semibold text-sm hover:text-foreground/80 ease duration-150">{username}</Link>
                  <h1 className="min-w-0">{postData.caption}</h1>
                </div>
              </div>
            </div>
            
            {/* likes and comment input */}
            <div className="border-t border-gray h-[150px] flex flex-col justify-between">
              <div className="flex flex-col px-3.5 pt-2.5">
                <button className="w-fit"><img src="/icons/heart.svg" className="w-7"/></button>
                <h1 className="text-sm font-medium">8 likes</h1>
                <h1 className="text-xs font-light text-neutral-400">{getDate(postData.updated_at)}</h1>
              </div>
              <div className="h-fit p-2.5 flex items-center">
                <input placeholder="Add a comment..." className="bg-background w-full text-sm p-1 outline-none"></input>
                <button className="text-accent font-medium text-sm hover:text-accent/80 ease duration-150">Post</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}