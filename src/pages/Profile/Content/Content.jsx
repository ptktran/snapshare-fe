// Imports
import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../../auth/Auth';
import { toast, Toaster } from "react-hot-toast";
import './Content.css';

// default function
export default function Content() {

  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userData, setUserData] = useState([])
  // console.log(bio, username, website)
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
    setUsername(userData.username);
    setBio(userData.user_bio);
    setProfileImage(userData.user_profile || '');
    setWebsite(userData.user_website || '');
  }, [userData, isEditing])
  
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
      setHasProfile(true)
    } else {
      toast(<button onClick={() => setIsEditing(true)}>Create your profile to get started!</button>, { icon: '👋', duration: 3000, id: "signup" })
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
      if (error && error.code === "23505") {
        toast.error((<h1><b>{username}</b> already exists, please try again.</h1>), { id: "duplicate"})
      } else {
        setIsEditing(false);
        setHasProfile(true)
        fetchUserProfile()
      }
    } catch (error) {
      console.log(error)
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
        const { error } = await supabase.from('users123').update(userProfile).eq('user_id', user.id);
        if (error && error.code === "23505") {
          toast.error((<h1><b>{username}</b> already exists, please try again.</h1>), { id: "duplicate"})
        } else {
          fetchUserProfile()
          setIsEditing(false)
        }
      } else {
        throw new Error('No user_id found. Cannot update the profile.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


  //////posts section
  const [image_url, setImage_url] = useState("");
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);
  const [post2, setPost2] = useState([]);
  const [post3, setPost3] = useState([]);

  console.log(image_url);
  console.log(caption);

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

  //display image
  const bucket_url = "https://cmknbeginwvrwzxmgdgy.supabase.co/storage/v1/object/public/Upload/"
  const bucket_url2 = "https://cmknbeginwvrwzxmgdgy.supabase.co/storage/v1/object/public/Profile/"

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
            {isEditing && (
              <div>
                <h1><b>@{username}</b></h1>
                <p>{bio}</p> {/* Display current bio as you type */}
              </div>
            )}
          </div>
        <div className="profile-right">
          {isEditing ? (
            <div className="edit-profile-modal">
              <div className="edit-profile-input">
                <label htmlFor="username">Edit Username</label><br/>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="bio">Edit Bio (max 50 characters)</label><br/>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={handleBioChange}
                  maxLength={50}
                  autoComplete="off"
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="profile-image">Change Profile Photo</label><br/>
                <input
                  type="url"
                  id="profile-image"
                  placeholder="Image url"
                  value={profileImage}
                  onChange={handleImageInput}
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="website">Edit External Website</label><br/>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={handleWebsiteChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="edit-button-container">
              {!hasProfile ? ( 
                <button className="standout create-button" onClick={createProfile}>
                  Create Profile
                </button>
              ) : (
                <div className="edit-button-container">
                  <button className="standout save-button" onClick={() => {setIsEditing(false)}}>
                    Cancel
                  </button>
                  <button className="standout save-button" onClick={handleSave}>
                    Save
                  </button>
                </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="username-tab">
                <p>{userData.username}</p>
              </div>
              <button className="standout edit-button" onClick={toggleEditing}>
                {!hasProfile ? <h1>Create Profile</h1> : <h1>Edit Profile</h1>}
              </button>
              <div className="displayed-items">
                {userData.user_bio ? (
                  <p>{userData.user_bio}</p>
                ) : (
                  <p>Profile not created</p>
                )}
                {userData.user_website && (
                  <p>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {userData.user_website}
                    </a>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Conditional rendering for the line and "Posts," "Saved," and "Tagged" buttons */}
      {!isEditing && (
        <>
          <div className="profile-line"></div>
          <div className="profile-buttons">
            <button className="profile-button">⊞ Posts</button>
            <button className="profile-button">▽ Saved</button>
            <button className="profile-button">🏳 Tagged</button>
          </div>

          {/* Posts */}
          <div class="posts">
            {posts.map((post) => (
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
                        
                <div class="popup" id="imagePop">
                  <button onClick={()=>{closeImg()}}>&times;</button>
                  <button class="right" onClick={()=>{openEdit(post3.post_id)}}>Edit</button>

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
                </div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
    </div>
    <Toaster toastOptions={{
      duration: 1700
    }}/>
  </div> 
  );
}
