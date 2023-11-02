import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Carousel } from "@material-tailwind/react";
import ErrorPage from "../Error/ErrorPage";

export default function PostPage() {
  const { postId } = useParams()
  const [postData, setPostData] = useState([])
  const [username, setUsername] = useState("")
  const [userData, setUserData] = useState([])
  const [errorCode, setErrorCode] = useState()
  console.log(postData)
  console.log(username)
  console.log()
  useEffect(() => {
    fetchUserPost(postId)
  },[])
  
  const fetchUserPost = async (postId) => {
    try {
      await fetch(`http://localhost:3000/getPost/${postId}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setPostData(data.data[0])
          fetchUsername(data.data[0].user_id)
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
  
  function isImage(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    if (imageExtensions.test(url)) return true
    return false
  }

  if (errorCode) return <ErrorPage errorCode={errorCode} />

  return (
    <>
      <main className="ml-0 md:ml-64 flex justify-center items-start">
        <div className="w-[850px] h-[650px] flex items-center mt-10">
          <Carousel className="h-full w-full flex items-center border border-gray border-r-0">
            {postData.file_url && postData.file_url.map((url) => (
              isImage(url) ? (
                <img src={url} alt="post-image" className="h-full w-full object-cover"/>
              ) : (
              <video src={url} controls loop class="h-full w-full object-fit" />)
            ))}
          </Carousel>
          <section className="w-[450px] border border-gray h-full flex flex-col justify-between">
            <Link to={`/user/${username}`} className="h-[50px] border-b border-gray flex items-center gap-2 p-2.5 hover:text-foreground/80 ease duration-150">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-gray">
                <img src={userData.profile_picture_url} className="object-cover h-full w-full"/>
              </div>
              <h1 className="font-medium text-sm">{username}</h1>
            </Link>
            <div className="h-full text-sm flex-col items-start justify-start p-3">
              <h1>No comments yet!</h1>
            </div>
            <div className="h-fit p-2.5 border-t border-gray flex items-center">
              <input placeholder="Add a comment..." className="bg-background w-full text-sm p-1 outline-none"></input>
              <button className="text-accent font-medium text-sm hover:text-accent/80 ease duration-150">Post</button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}