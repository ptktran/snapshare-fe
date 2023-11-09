// Imports
import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../../auth/Auth';
import './Content.css';
import Comment from './Comment'; 

// default function
export default function Content() {

  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [createButtonClicked, setCreateButtonClicked] = useState(false);

  // Edit mode + handling changes
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  const handleBioChange = (e) => {
    const newBio = e.target.value;
    setBio(newBio);
  };
  const handleImageInput = (e) => {
    const imageUrl = e.target.value;
    setProfileImage(imageUrl);
  };
  const handleWebsiteChange = (e) => {
    const newWebsite = e.target.value;
    setWebsite(newWebsite);
  };
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };


  useEffect(() => {
    fetchUserProfile(); 
  }, []);


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
      setUsername(user.username);
      setBio(user.user_bio);
      setProfileImage(user.profile_picture_url || '');
      setWebsite(user.website || '');
    }
  };

  // Creates a profile 
  async function createProfile() {
    try {
      const { error } = await supabase
        .from('users123')
        .upsert([
          {
            user_id: user.id,
            username,
            email: user.email,
            user_bio: bio,
            profile_picture_url: profileImage ? profileImage : `https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg`,
            website,
          },
        ]);
      if (error) {
        throw error;
      }
      setIsEditing(false);
      setCreateButtonClicked(true);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }



  // Edits the profile
  const handleSave = async () => {
    try {
      if (user.id) {
        const userProfile = {
          username,
          user_bio: bio,
          profile_picture_url: profileImage,
          website,
        };
        await supabase.from('users123').update(userProfile).eq('user_id', user.id);
        setIsEditing(false);
      } else {
        throw new Error('No user_id found. Cannot update the profile.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


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

  //////posts section
  const [image_url, setImage_url] = useState("");
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);
  const [post2, setPost2] = useState([]);
  const [post3, setPost3] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [currentView, setCurrentView] = useState('posts');

  console.log(image_url);
  console.log(caption);
  console.log(user);

  //get posts
  async function getPosts() {
    try {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)   //get posts from current user user.user_id
        .order('post_id', { ascending:false });     //recent post first

    if (error) throw error;

    if (data != null) {
        setPosts(data);
    }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
      getPosts();
  }, [])

  //update post
  async function updatePost(postId) {
    const today = new Date();
 
    try {
    const { data, error } = await supabase
        .from('posts')
        .update({
          image_url: image_url,
          caption: caption,
          updated_at: today
        })
        .eq('user_id', user.id)       //user_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&& NEED TO CHANGE
        .eq('post_id', postId)

    if (error) throw error;
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  }


  //delete post
  async function deletePost(postId) {
      try {
      const { data, error } = await supabase
          .from('posts')
          .delete()
          .eq('post_id', postId)   //id of post to delete
          .eq('user_id', user.id);  //check post belong to user user_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&& NEED TO CHANGE

      if (error) throw error;
        window.location.reload();
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


    

  // Formatting + Buttons
  return (
    <div className="page-container"> 
      <div className="content-container">
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-left">
            <div className="profile-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
              <div className="profile-image-placeholder">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" alt="Profile" className="profile-image" />
              </div>
            )}
          </div>
        </div>
        <div className="profile-right">
          {isEditing ? (
            <div className="edit-profile-modal">
              <div className="edit-profile-input">
                <label htmlFor="bio">Edit Bio (max 50 characters):</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={handleBioChange}
                  maxLength={50}
                  autoComplete="off"
                />
                <p>Current Bio: {bio}</p> {/* Display current bio as you type */}
              </div>
              <div className="edit-profile-input">
                <label htmlFor="profile-image">Change Profile Photo:</label>
                <input
                  type="url"
                  id="profile-image"
                  value={profileImage}
                  onChange={handleImageInput}
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="website">Edit External Website:</label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={handleWebsiteChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="username">Edit Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="edit-button-container">
              {!createButtonClicked ? ( 
                <button className="standout create-button" onClick={createProfile}>
                  Create Profile
                </button>
              ) : (
                <button className="standout save-button" onClick={handleSave}>
                  Save
                </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="username-tab">
                <p>{username}</p>
              </div>
              <button className="standout edit-button" onClick={toggleEditing}>
                Edit Profile
              </button>
              <div className="displayed-items">
                {bio ? (
                  <p>{bio}</p>
                ) : (
                  <p>null</p>
                )}
                {website && (
                  <p>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {website}
                    </a>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Conditional rendering for the line and "Posts" and "Liked" buttons */}
      {!isEditing && (
        <>
          <div className="profile-line"></div>
          <div className="profile-buttons">
            <button className="profile-button" onClick={() => setCurrentView('posts')}>⊞ Posts</button>
            <button className="profile-button" onClick={() => {setCurrentView('liked'); getLikedPosts();}}>♡ Liked Posts</button>
          </div>

          {/* Liked Posts */}
            {currentView === 'liked' && (
              <div className="saved_posts_container">
                {likedPosts.map((post) => (
                  <div key={post.post_id} className="post_container">
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
                ))}
              </div>
            )}

          {/* Posts */}
          <div class="posts">
            {currentView === 'posts' && posts.map((post) => (
              <div key={post.post_id}>
                <div class="post_container" onClick={()=>{openImg(post.post_id)}}>
                  <button>
                    {post.file_url ? (
                        isImageLink(post.file_url[0]) ? (
                            <img src={post.file_url[0]} alt="Image" class="post_content"/>
                        ) : isVideoLink(post.file_url[0]) ? (
                          <video src={post.file_url[0]} autoPlay muted loop class="post_content"/>
                        ) : (
                            <h1 class="post_content" >No media</h1>
                        )
                    ) : (
                        <h1 class="post_content" >No media</h1>
                    )}                    
                  </button> 
                </div>   
                {/* Popup image */}        
                <div class="popup" id="imagePop">
                  <button onClick={()=>{closeImg()}}>&times;</button>
                  <button class="right" onClick={()=>{openEdit(post3.post_id)}}>Edit</button>
                  {/* Popup Edit form */}
                  <div class="popup" id="myForm">
                    <button onClick={()=>{closeEdit()}}>&times;</button>
                    <button class="right" onClick={()=>{updatePost(post2.post_id)}}>Done</button>
                        <div class="flex">
                      <div>
                        {profileImage ? (
                            <img src={profileImage} class="profile_image" />
                          ) : (
                          <div className="profile-image-placeholder">
                            <img src="https://cdn141.picsart.com/357697367045201.jpg" class="profile_image"/>
                          </div>
                        )}
                      </div>
                      <div className="block">
                        <h3>{username}</h3>
                        <p class="right">{post2.created_at}</p>
                      </div>
                    </div>
  
                    <div class="center">
                      <div class="carousel_container">
                        {/* Image Carousel in edit */}
                        {getSlides(post3.file_url)}
                      
                        <div class="carousel" style={{ transform: `translateX(-${curr * 100}%)` }}>
                          {Array.isArray(slides) ? (
                            slides.map((slide) => (
                              isImageLink(slide) ? (
                                <img src={slide} alt="Image" class="carousel_content"/>
                              ) : isVideoLink(slide) ? (
                                <video src={slide} controls loop class="carousel_content" />
                              ) : (
                                <h1 class="carousel_content">No media</h1>
                              )
                            ))
                          ) : (
                            <h1>No media display</h1>
                          )}
                        </div>
                      </div>
                    </div>
                    <div width="600px">
                      <button onClick={prev}>Prev</button>  
                      <button class="right" onClick={next}>Next</button>  
                      <input class="caption" type="text" defaultValue={post2.caption} id="caption" onChange={(e) => { setCaption(e.target.value) }}/>
                    </div>
                  </div>
                  {/* Back to popup form */}
                  <div class="flex">
                    <div>
                        {profileImage ? (
                            <img src={profileImage} class="profile_image" />
                          ) : (
                          <div className="profile-image-placeholder">
                            <img src="https://cdn141.picsart.com/357697367045201.jpg" class="profile_image" />
                          </div>
                        )}
                      </div>
                    <div className="block">
                      <h3>{username}</h3>
                      <p class="right">{post3.created_at}</p>
                    </div>
                  </div>
                  
                  {/* Image Carousel */}    
                  <div class="center"> 
                    <div class="carousel_container">
                      {/* Image Carousel in edit */}
                      {getSlides(post3.file_url)}
                    
                      <div class="carousel" style={{ transform: `translateX(-${curr * 100}%)` }}>
                        {Array.isArray(slides) ? (
                          slides.map((slide) => (
                            isImageLink(slide) ? (
                              <img src={slide} alt="Image" class="carousel_content"/>
                            ) : isVideoLink(slide) ? (
                              <video src={slide} controls loop class="carousel_content" />
                            ) : (
                              <h1 class="carousel_content">No media</h1>
                            )
                          ))
                        ) : (
                          <h1>No slides to display</h1>
                        )}
                      </div>
                    </div> 
                  </div>  
                  <div width="600px">
                    <button onClick={prev}>Prev</button>  
                    <button class="right" onClick={next}>Next</button>                                          
                    <h3 class="caption">{post3.caption}</h3>
                    <button class="right" onClick={()=>{deletePost(post3.post_id)}}>Delete Post</button>
                    <br/>
                  </div>

                <Comment postId={post3.post_id} user_id={post3.user_id} />

                </div>
              </div>
            ))}
          </div>

        </>
      )}    
    </div>
    </div>
  </div> 
  );
}