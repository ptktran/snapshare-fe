import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorPage from "../Error/ErrorPage";
import Carousel from "../../components/Carousel/Carousel";
import { getDate } from "../../utils/DateFormatter";
import Loader from "../../components/Loader/Loader";
import { useAuth, supabase } from '../../auth/Auth';

export default function PostPage() {
  const { postId } = useParams()
  const [postData, setPostData] = useState([])
  const [postImages, setPostImages] = useState([])
  const [username, setUsername] = useState("")
  const [userData, setUserData] = useState([])
  const [errorCode, setErrorCode] = useState()
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState(0);
  const { user } = useAuth();
  const [heartIcon, setHeartIcon] = useState("/icons/heart.svg");
  const [isLiked, setIsLiked] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("")

  useEffect(() => {
    fetchUserPost(postId)
    fetchLikes(postId);
    if (user) {
      checkIfLiked();
    }
    getUsername()
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

  const getUsername = async () => {
    const { data, error } = await supabase
    .from('users123')
    .select('username')
    .eq('user_id', user.id)

    if (data) {
      setCurrentUsername(data[0].username)
    }
    if (error) {
      console.log(error)
    }
  }

  const sendEmail = async () => {
    var message = "liked your post on Snapshare.";
    var message2 = "Log into Snapshare to view your liked post.";
    var subject = "Someone Liked Your Post!";
    
    const response = await fetch('http://localhost:3000/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: currentUsername, email: userData.email, message: message, message2: message2, subject: subject}),
    })
    if (response.status === 200) {
      console.log("Email sent successfully")
    }

    const { error } = await supabase
    .from('notification')
    .insert([{user_id: user.id, interacter_id: userData.user_id, user_username: currentUsername, interacter_username: userData.username, profile_link: currentUsername, interaction_type: "like", post_link: `/post/${postId}`}])
    .select()

    if (error) {
      console.log(error)
    }
  }
  
  // Get the posts likes from supabase
  const fetchLikes = async (postId) => {
    const { data, error } = await supabase
      .from('likes') 
      .select('like_count')
      .eq('post_id', postId)
      .single();
  
    if (error) {
      console.log('Error fetching likes:', error);
    } else {
      setLikes(data ? data.like_count : 0); 
    }
  };

  // Check if user liked and update the heart accordingly
  const checkIfLiked = async () => {
    const { data, error } = await supabase
      .from('user_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id);
  
    if (error) {
      console.error('Error fetching like status:', error);
    } else {
      const liked = data && data.length > 0;
      setIsLiked(liked);
      setHeartIcon(liked ? "/icons/heart-filled.png" : "/icons/heart.svg");
    }
  };

  // Toggle like/unlike the post
  const toggleLike = async () => {
    // Check if the user is trying to like their own post
    if (user.id === postData.user_id) {
    console.log("Cannot like your own post.");
    return; // Stop the function from proceeding further
    }

    let newLikes = isLiked ? likes - 1 : likes + 1;
    setIsLiked(!isLiked);
    setLikes(newLikes);
    setHeartIcon(!isLiked ? "/icons/heart-filled.png" : "/icons/heart.svg");
    
    if (isLiked) {
      // User is unliking the post
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .match({ user_id: user.id, post_id: postId });
      if (error) {
        console.error('Error unliking the post:', error);
      } else {
        // Only update state if the unliking was successful
        setLikes(newLikes);
        setIsLiked(false);
        setHeartIcon("/icons/heart.svg");
      }
    } else {
      // User is liking the post
      const { error } = await supabase
        .from('user_likes')
        .insert({ user_id: user.id, post_id: postId });
      if (error) {
        console.error('Error liking the post:', error);
      } else {
        // Only update state if the liking was successful
        setLikes(newLikes);
        setIsLiked(true);
        setHeartIcon("/icons/heart-filled.png");
        sendEmail()
      }
    }

    // Attempt to update the like count in the 'likes' table regardless of like/unlike
    const { error: likesError } = await supabase
      .from('likes')
      .upsert({ post_id: postId, like_count: newLikes }, { onConflict: 'post_id' });
    if (likesError) {
      console.error('Error updating like count:', likesError);
      // If there was an error updating the like count, revert the state changes
      setLikes(likes); // revert back to original likes
      setIsLiked(!isLiked); // revert the isLiked state
      setHeartIcon(isLiked ? "/icons/heart-filled.png" : "/icons/heart.svg"); // revert the icon
    }
  };


  // if no post is found return error page, if loading return loading page
  if (errorCode) {
    return <ErrorPage errorCode={errorCode} />
  } else if (loading) {
    return <Loader />
  }

  return (
    <>
      <main className="ml-0 md:ml-64 flex justify-center items-start pt-7">
        <div className="w-[850px] h-[650px] flex items-center">
          {/* render image carousel */}
          {postImages ? (
            <Carousel images={postImages} cover={true}/>
          ) : (<h1>An error has occured, please try again later.</h1>)}
          {/* banner with username, profile pic and date */}
          <section className="w-[450px] border border-gray h-full flex flex-col justify-between">
            <Link to={`/${username}`} className="h-[50px] border-b border-gray flex items-center justify-between p-2.5 hover:text-foreground/80 ease duration-150">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray">
                  <img src={userData.profile_picture_url} className="object-cover h-full w-full"/>
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
                <button className="w-fit" onClick={toggleLike}>
                  <img src={heartIcon} className="w-7"/>
                </button>
                <h1 className="text-sm font-medium">{likes} likes</h1>
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