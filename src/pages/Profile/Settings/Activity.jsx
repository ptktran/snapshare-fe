import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../../auth/Auth';
import { Link } from 'react-router-dom';

import './Activity.css';
import Comment from '../Content/Comment';

// default function
export default function Content() {

  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [createButtonClicked, setCreateButtonClicked] = useState(false);
  const [comments, setComments] = useState([]);

  const [commentedPosts, setCommentedPosts] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [image_url, setImage_url] = useState("");
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);
  const [post2, setPost2] = useState([]);
  const [post3, setPost3] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentView, setCurrentView] = useState('liked');

  console.log(image_url);
  console.log(user);
  
  const fetchCommentedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('post_id, user_id, image_url, caption, created_at')
        .in('post_id', comments.map((comment) => comment.post_id));

      if (error) {
        console.error('Error fetching commented posts:', error);
      } else {
        const postsWithComments = data.map((post) => {
          const postComments = comments.filter((comment) => comment.post_id === post.post_id);
          return { ...post, comments: postComments };
        });

        setCommentedPosts(postsWithComments);
        console.log('Commented Posts:', postsWithComments);
      }
    } catch (error) {
      console.error('Error fetching commented posts:', error);
    }
  };

  useEffect(() => {
    // Fetch comments and usernames
    async function fetchData() {
      await fetchComments();
      await fetchCommentedPosts();
      try {
        const { data, error } = await supabase
          .from('users123')
          .select('user_id, username');

        if (error) {
          console.error('Error fetching usernames:', error);
        } else {
          const usernameMap = {};
          data.forEach((user) => {
            usernameMap[user.user_id] = user.username;
          });
          setUsername(usernameMap);
        }
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    }
    

    fetchData();
  }, [caption],
  [user.id]);



  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments_test')
        .select('id, user_id, post_id, comment_text, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        const postCaptionsMap = {};
        const postIds = data.map((comment) => comment.post_id);
      const { data: postCaptionsData, error: postCaptionsError } = await supabase
        .from('posts')
        .select('post_id, caption')
        .in('post_id', postIds);

      if (postCaptionsError) {
            console.error('Error fetching post captions:', postCaptionsError);
          } else {
            postCaptionsData.forEach((post) => {
              postCaptionsMap[post.post_id] = post.caption;
            });
          }
          const commentsWithCaptions = data.map((comment) => {
            return { ...comment, caption: postCaptionsMap[comment.post_id] || '' };
          });

          const sortedComments = commentsWithCaptions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch commented posts

  // Edit mode + handling changes
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  
  useEffect(() => {
    // Fetch comments, usernames, and profile pictures
    async function fetchData() {
      try {
        const [commentsData, usersData] = await Promise.all([
          supabase.from('comments_test').select('id, user_id, post_id, comment_text, created_at, updated_at').eq('user_id', user.id),
          supabase.from('users123').select('user_id, username, profile_picture_url')
        ]);

        const comments = commentsData.data;

        if (usersData.error || commentsData.error) {
          console.error('Error fetching data:', usersData.error || commentsData.error);
        } else {
          // Map usernames and profile picture URLs
          const usernameMap = {};
          const profilePicMap = {};
          
          usersData.data.forEach((user) => {
            usernameMap[user.user_id] = user.username;
            profilePicMap[user.user_id] = user.profile_picture_url || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
          });

          setUsername(usernameMap);
          setProfileImage(profilePicMap);

          setComments(comments);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, 
  [user.id]);

  

  // This function gets posts that the current user has liked
  async function getLikedPosts() {
    try {
      // First, get the IDs of the posts that the user has liked
      const { data: likedData, error: likedError } = await supabase
        .from('user_likes')
        .select('post_id')
        .eq('user_id', user.id); // Get likes from current user
      if (likedError) throw likedError;
      // If there are liked posts, then get those posts
      if (likedData != null) {
        // Extracting all the post IDs that the user has liked
        const postIds = likedData.map((like) => like.post_id);
        // Now get the posts details by the post IDs
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .in('post_id', postIds); // Get posts that have an ID in the postIds array
        if (postsError) throw postsError;
        if (postsData != null) {
          setLikedPosts(postsData);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  }



 //pop up form
 function openEdit(postId){
    document.getElementById("myForm").style.display = "block";
    posts.map((post)=>{
      if(post.post_id==postId){
        setPost2({ post_id:post.post_id, image_url:post.image_url, caption:post.caption, created_at: post.created_at, file_url: post.file_url})
        setCaption(post.caption)
        setImage_url(post.image_url)
      }
    })
  }

  function closeEdit(){
    document.getElementById("myForm").style.display = "none";
  } 
  
  function openImg(postId){
    document.getElementById("imagePop").style.display = "block";
    posts.map((post)=>{
      if(post.post_id==postId){
        setPost3({ post_id:post.post_id, image_url:post.image_url, caption:post.caption, created_at: post.created_at, file_url: post.file_url})
      }
    })
  } 

  function closeImg(){
    document.getElementById("imagePop").style.display = "none";
  } 

  var slides;

  //image carousel
  function getSlides(fileURL){   
    slides = fileURL;    
  }

  //move between images/videos
  const [curr, setCurr] = useState(0);

  const prev = () => {
    //if first slide, go to last, else forward
    setCurr((curr) => (curr == 0 ? (slides.length - 1) : (curr - 1)));
  }
    

  const next = () => {
    //if last slide, go to first, else next
    setCurr((curr) => (curr == (slides.length - 1) ? (0) : (curr + 1)));
  }

  //determine if image or video
  function isImageLink(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    return imageExtensions.test(url);
  }

  function isVideoLink(url) {
      const videoExtensions = /\.(mp4|webm|ogg|avi|mkv|mov)$/i;
      return videoExtensions.test(url);
  }

  const toggleShowComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };
  
  
const Comment = ({ postId, user_id, image_url }) => {
  // Your Comment component logic

  return (
    <div className="comment">
      {/* Your existing Comment component JSX */}
      <div className="commented-post-icon">
        {image_url && <img src={image_url} alt="Commented Post Icon" />}
      </div>
    </div>
  );
};


 
  // Formatting + Buttons
  return (
    <div className="page-container"> 
      <div className="content-container">
      <div className="profile-page">
        <br />
        <div className= "title">
      <h1 className="text-3xl font-bold text-center">Interactions:</h1>
      <br/>
      </div>
        <div className="profile-container">
           
          <div className="profile-left">
          
        </div>
        <div className="profile-right">
              
              
            
        </div>
      </div>
      {!showComments && (
  <>
    <div className="comment-container">
      {/* Display commented posts */}
      <div className="commented-posts">
        <div className="profile-line1"></div>
        <i class="bx bx-comment-dots"></i> My Comments: 
        Newest to oldest
      </div>

      <div className="comment-list">
        {/* Display comments */}
        {comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <div className="comment-header">
              <span className="comment-user">
                <img
                  className="profile-image1"
                  src={profileImage[comment.user_id]}
                  alt="Profile"
                />
                {username[comment.user_id] || 'Unknown User'}
              </span>
            </div>
            <>
              <p className="comment-text1">
                {comment.comment_text} 
                {/* Commented On link */}
                <div className='comment-on'>
                  <Link to={`/post/${comment.post_id}`}> 
                    Commented Post Caption: <span>{comment.caption}</span>
                    
              </Link>
            
              
      
   
  
                </div>
              </p>
            
               
              
              
            </>
          </div>
        ))}
      </div>

      {/*  */}
      {/* ... */}
    </div>
  </>
)}

        
        
      {/* Conditional rendering for the line and "Posts" and "Liked" buttons */}
      {!isEditing && (
        <>
          <div className="profile-line"></div>
          <div className="profile-buttons">
           
            <button className="profile-button" onClick={() => {setCurrentView('liked'); getLikedPosts();}}> <i class="bx bx-bookmark-heart"></i>  My Liked Posts</button>
          </div>

          {/* Liked Posts */}
            {currentView === 'liked' && (
              <div className="saved_posts_container">
                {likedPosts.map((post) => (
                   <a key={post.post_id} href={`/post/${post.post_id}`} className="post_link">
                     <div className="post_container">
                    {post.file_url ? (
                      isImageLink(post.file_url[0]) ? (
                        <img src={post.file_url[0]} alt="Image" className="post_content"/>
                      ) : isVideoLink(post.file_url[0]) ? (
                        <video src={post.file_url[0]} autoPlay muted loop className="post_content"/>
                      ) : (
                        <h1 className="post_content">No media</h1>
                      )
                    ) : (
                      <h1 className="post_content">No media</h1>
                    )}
                  </div>
                  </a>
                ))}
              </div>
            )}

          {/* */}
          
        

        </>
      )}
    </div>
    </div>
  </div>
  
  
  );
  
}
