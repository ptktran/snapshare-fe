// Imports
import React, { useState, useEffect } from "react";
import { useAuth, supabase } from "../../../auth/Auth";
import "./Content.css";
import Comment from "./Comment";
import { Link } from "react-router-dom";
import { getDate } from "../../../utils/DateFormatter";

// default function
export default function Content() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [createButtonClicked, setCreateButtonClicked] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [showFollower, setShowFollower] = useState(false);

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
      .from("users123")
      .select()
      .eq("user_id", user.id);
    if (error) {
      console.error("Error fetching user profile:", error);
      return;
    }
    if (data.length > 0) {
      const user = data[0];
      setUsername(user.username);
      setBio(user.user_bio);
      setProfileImage(user.profile_picture_url || "");
      setWebsite(user.website || "");
    }
  };

  // Creates a profile
  async function createProfile() {
    try {
      const { error } = await supabase.from("users123").upsert([
        {
          user_id: user.id,
          username,
          email: user.email,
          user_bio: bio,
          profile_picture_url: profileImage
            ? profileImage
            : `https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg`,
          website,
        },
      ]);
      if (error) {
        throw error;
      }
      setIsEditing(false);
      setCreateButtonClicked(true);
    } catch (error) {
      console.error("An error occurred:", error);
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
        await supabase
          .from("users123")
          .update(userProfile)
          .eq("user_id", user.id);
        setIsEditing(false);
      } else {
        throw new Error("No user_id found. Cannot update the profile.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // This function gets posts that the current user has liked
  async function getLikedPosts() {
    try {
      // First, get the IDs of the posts that the user has liked
      const { data: likedData, error: likedError } = await supabase
        .from("user_likes")
        .select("post_id")
        .eq("user_id", user.id); // Get likes from current user
      if (likedError) throw likedError;
      // If there are liked posts, then get those posts
      if (likedData != null) {
        // Extracting all the post IDs that the user has liked
        const postIds = likedData.map((like) => like.post_id);
        // Now get the posts details by the post IDs
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .in("post_id", postIds); // Get posts that have an ID in the postIds array
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
  const [currentView, setCurrentView] = useState("posts");

  console.log(image_url);
  console.log(caption);
  console.log(user);

  //get posts
  async function getPosts() {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id) //get posts from current user user.user_id
        .order("post_id", { ascending: false }); //recent post first

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
  }, []);

  //update post
  async function updatePost(postId) {
    const today = new Date();

    try {
      const { data, error } = await supabase
        .from("posts")
        .update({
          image_url: image_url,
          caption: caption,
          updated_at: today,
        })
        .eq("user_id", user.id) //user_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&& NEED TO CHANGE
        .eq("post_id", postId);

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
        .from("posts")
        .delete()
        .eq("post_id", postId) //id of post to delete
        .eq("user_id", user.id); //check post belong to user user_id &&&&&&&&&&&&&&&&&&&&&&&&&&&&& NEED TO CHANGE

      if (error) throw error;
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  }

  //pop up form
  function openEdit(postId) {
    document.getElementById("myForm").style.display = "block";
    posts.map((post) => {
      if (post.post_id == postId) {
        setPost2({
          post_id: post.post_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          file_url: post.file_url,
        });
        setCaption(post.caption);
        setImage_url(post.image_url);
      }
    });
  }

  function closeEdit() {
    document.getElementById("myForm").style.display = "none";
  }

  function openImg(postId) {
    document.getElementById("imagePop").style.display = "block";
    posts.map((post) => {
      if (post.post_id == postId) {
        setPost3({
          post_id: post.post_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          file_url: post.file_url,
        });
      }
    });
  }

  function closeImg() {
    document.getElementById("imagePop").style.display = "none";
  }

  var slides;

  //image carousel
  function getSlides(fileURL) {
    slides = fileURL;
  }

  //move between images/videos
  const [curr, setCurr] = useState(0);

  const prev = () => {
    //if first slide, go to last, else forward
    setCurr((curr) => (curr == 0 ? slides.length - 1 : curr - 1));
  };

  const next = () => {
    //if last slide, go to first, else next
    setCurr((curr) => (curr == slides.length - 1 ? 0 : curr + 1));
  };

  //determine if image or video
  function isImageLink(url) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
    return imageExtensions.test(url);
  }

  function isVideoLink(url) {
    const videoExtensions = /\.(mp4|webm|ogg|avi|mkv|mov)$/i;
    return videoExtensions.test(url);
  }
  async function fetchFollowingUsers() {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("follower_id, following_id")
        .eq("follower_id", user.id);

      if (data) {
        // Extract user IDs from the data
        const followingUserIds = data.map((item) => item.following_id);
        // Fetch user profiles based on the extracted user IDs
        const { data: usersData, error: usersError } = await supabase
          .from("users123")
          .select("user_id, username, profile_picture_url")
          .in("user_id", followingUserIds);

        if (usersData) {
          setFollowingUsers(usersData);
        }

        if (usersError) {
          throw usersError;
        }
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("An error occurred while fetching following users:", error);
    }
  }
  useEffect(() => {
    fetchFollowingUsers();
  }, []);

  const handleFollowingClick = () => {
    setShowFollowing(!showFollowing);
    // Fetch following users only when the button is clicked
    if (!showFollowing) {
      fetchFollowingUsers();
    }
  };

  async function fetchFollowerUsers() {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("follower_id, following_id")
        .eq("following_id", user.id);

      if (data) {
        // Extract user IDs from the data
        const followerUserIds = data.map((item) => item.follower_id);
        // Fetch user profiles based on the extracted user IDs
        const { data: usersData, error: usersError } = await supabase
          .from("users123")
          .select("user_id, username, profile_picture_url")
          .in("user_id", followerUserIds);

        if (usersData) {
          setFollowerUsers(usersData);
        }

        if (usersError) {
          throw usersError;
        }
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("An error occurred while fetching following users:", error);
    }
  }
  useEffect(() => {
    fetchFollowerUsers();
  }, []);

  const handleFollowerClick = () => {
    setShowFollower(!showFollower);
    // Fetch followers only when the button is clicked
    if (!showFollower) {
      fetchFollowerUsers();
    }
  };

  async function countFollowing() {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("follower_id")
        .eq("following_id", user.id);

      if (data) {
        setFollowingCount(data.length);
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  useEffect(() => {
    countFollowing();
  }, []);

  async function countFollowers() {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", user.id);

      if (data) {
        setFollowersCount(data.length);
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  useEffect(() => {
    countFollowers();
  }, []);

  // Formatting + Buttons
  return (
    <div className="page-container ml-0 md:ml-64">
      <div className="content-container w-full">
        <div className="profile-page">
          <div className="profile-container">
            <div className="profile-left w-fit md:w-[350px] p-0 md:p-11 text-center break-words gap-5 flex flex-col">
              <div className="profile-image-container w-[90px] h-[90px] md:w-[150px] md:h-[150px]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                      alt="Profile"
                      className="profile-image"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="profile-right w-fit md:w-[350px]">
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
                    <p>Current Bio: {bio}</p>{" "}
                    {/* Display current bio as you type */}
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
                      <button
                        className="standout create-button"
                        onClick={createProfile}
                      >
                        Create Profile
                      </button>
                    ) : (
                      <button
                        className="standout save-button"
                        onClick={handleSave}
                      >
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
                  <div className="button-container">
                    <button
                      className="standout edit-button"
                      onClick={toggleEditing}
                    >
                      Edit Profile
                    </button>
                    <Link className="standout edit-button" to="/settings">
                      Settings
                    </Link>
                  </div>
                  <div className="displayed-items">
                    {bio ? <p>{bio}</p> : <p></p>}
                    {website && (
                      <p>
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {website}
                        </a>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="f1">
            <button onClick={handleFollowerClick} className="hover:opacity-80 ease duration-150">
              <b>{followingCount}</b> followers
            </button>
            <button onClick={handleFollowingClick} className="hover:opacity-80 ease duration-150">
              <b>{followersCount}</b> following
            </button>
          </div>

          {showFollower && (
            <div className="following-users">
              <h2>My Followers:</h2>
              <ul>
                {followerUsers.map((followerUser) => (
                  <li key={followerUser.user_id}>
                    <img
                      src={
                        followerUser.profile_picture_url ||
                        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                      }
                      alt="Profile"
                      className="following-user-profile-image"
                    />
                    <Link to={`/${followerUser.username}`}>
                      <span>{followerUser.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showFollowing && (
            <div className="following-users">
              <h2>Following Users:</h2>
              <ul>
                {followingUsers.map((followingUser) => (
                  <li key={followingUser.user_id}>
                    <img
                      src={
                        followingUser.profile_picture_url ||
                        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                      }
                      alt="Profile"
                      className="following-user-profile-image"
                    />
                    <Link to={`/${followingUser.username}`}>
                      <span>{followingUser.username}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conditional rendering for the line and "Posts" and "Liked" buttons */}
          {!isEditing && (
            <>
              <div className="bg-gray h-[1px] mt-6"></div>
              <div className="profile-buttons">
                <button
                  className="profile-button"
                  onClick={() => setCurrentView("posts")}
                >
                  ⊞ Posts
                </button>
                <button
                  className="profile-button"
                  onClick={() => {
                    setCurrentView("liked");
                    getLikedPosts();
                  }}
                >
                  ♡ Liked Posts
                </button>
              </div>

              {/* Liked Posts */}
              {currentView === "liked" && (
                <div className="saved_posts_container">
                  {likedPosts.map((post) => (
                    <div
                      key={post.post_id}
                      className="flex items-center justify-center overflow-hidden relative m-2 w-[120px] h-[120px] md:w-[200px] md:h-[200px] hover:bg-black hover:opacity-50 ease duration-150 hover:cursor-pointer"
                    >
                      {post.file_url ? (
                        isImageLink(post.file_url[0]) ? (
                          <img
                            src={post.file_url[0]}
                            alt="Image"
                            className="object-cover h-full w-full"
                          />
                        ) : isVideoLink(post.file_url[0]) ? (
                          <video
                            src={post.file_url[0]}
                            autoPlay
                            muted
                            loop
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <h1 className="object-cover h-full w-full">
                            No media
                          </h1>
                        )
                      ) : (
                        <h1 className="object-cover h-full w-full">No media</h1>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Posts */}
              <div class="saved_posts_container">
                {currentView === "posts" &&
                  posts.map((post) => (
                    <div key={post.post_id}>
                      <div
                        class="flex items-center justify-center overflow-hidden relative m-2 w-[120px] h-[120px] md:w-[200px] md:h-[200px] hover:bg-black hover:opacity-50 ease duration-150 hover:cursor-pointer"
                        onClick={() => {
                          openImg(post.post_id);
                        }}
                      >
                        {post.file_url ? (
                          isImageLink(post.file_url[0]) ? (
                            <img
                              src={post.file_url[0]}
                              alt="Image"
                              class="object-cover h-full w-full"
                            />
                          ) : isVideoLink(post.file_url[0]) ? (
                            <video
                              src={post.file_url[0]}
                              autoPlay
                              muted
                              loop
                              class="object-cover h-full w-full"
                            />
                          ) : (
                            <h1 class="object-cover h-full w-full">No media</h1>
                          )
                        ) : (
                          <h1 class="object-cover h-full w-full">No media</h1>
                        )}
                      </div>
                      {/* Popup image */}
                      <div class="popup w-full h-full md:w-[700px] md:h-[700px]" id="imagePop">
                        <button
                          onClick={() => {
                            closeImg();
                          }}
                        >
                          &times;
                        </button>
                        <button
                          class="right"
                          onClick={() => {
                            openEdit(post3.post_id);
                          }}
                        >
                          Edit
                        </button>
                        {/* Popup Edit form */}
                        <div class="popup w-full h-full md:w-[700px] md:h-[700px]" id="myForm">
                          <button
                            onClick={() => {
                              closeEdit();
                            }}
                          >
                            &times;
                          </button>
                          <button
                            class="right"
                            onClick={() => {
                              updatePost(post2.post_id);
                            }}
                          >
                            Done
                          </button>

                          <div class="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] rounded-full">
                                {profileImage ? (
                                  <img src={profileImage} class="profile_image w-full h-full object-cover" />
                                ) : (
                                  <img
                                    src="https://cdn141.picsart.com/357697367045201.jpg"
                                    class="profile_image w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <h3>
                                  <Link to={`/profile`}>{username}</Link>
                                </h3>
                                <p class="right">{getDate(post2.created_at)}</p>
                              </div>
                            </div>
                          <Link
                            to={`/post/${post2.post_id}`}
                            className="hover:bg-black p-2.5 rounded-[10px]"
                          >
                            See full post
                          </Link>
                        </div>

                          <div class="center">
                            <div class="carousel_container w-full md:w-[600px]">
                              {/* Image Carousel in edit */}
                              {getSlides(post3.file_url)}

                              <div
                                class="carousel"
                                style={{
                                  transform: `translateX(-${curr * 100}%)`,
                                }}
                              >
                                {Array.isArray(slides) ? (
                                  slides.map((slide) =>
                                    isImageLink(slide) ? (
                                      <img
                                        src={slide}
                                        alt="Image"
                                        class="carousel_content"
                                      />
                                    ) : isVideoLink(slide) ? (
                                      <video
                                        src={slide}
                                        controls
                                        loop
                                        class="carousel_content"
                                      />
                                    ) : (
                                      <h1 class="carousel_content">No media</h1>
                                    )
                                  )
                                ) : (
                                  <h1>No media display</h1>
                                )}
                              </div>
                            </div>
                          </div>
                          <div width="600px">
                            <button onClick={prev}>Prev</button>
                            <button class="right" onClick={next}>
                              Next
                            </button>
                            <input
                              class="caption w-full md:w-[600px]"
                              type="text"
                              defaultValue={post2.caption}
                              id="caption"
                              onChange={(e) => {
                                setCaption(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        {/* Back to popup form */}

                        <div class="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] rounded-full">
                                {profileImage ? (
                                  <img src={profileImage} class="profile_image w-full h-full object-cover" />
                                ) : (
                                  <img
                                    src="https://cdn141.picsart.com/357697367045201.jpg"
                                    class="profile_image w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <h3>
                                  <Link to={`/profile`}>{username}</Link>
                                </h3>
                                <p class="right">{getDate(post3.created_at)}</p>
                              </div>
                            </div>
                          <Link
                            to={`/post/${post3.post_id}`}
                            className="hover:bg-black p-2.5 rounded-[10px]"
                          >
                            See full post
                          </Link>
                        </div>

                        {/* Image Carousel */}
                        <div class="center">
                          <div class="carousel_container w-full md:w-[600px]">
                            {/* Image Carousel in edit */}
                            {getSlides(post3.file_url)}

                            <div
                              class="carousel"
                              style={{
                                transform: `translateX(-${curr * 100}%)`,
                              }}
                            >
                              {Array.isArray(slides) ? (
                                slides.map((slide) =>
                                  isImageLink(slide) ? (
                                    <img
                                      src={slide}
                                      alt="Image"
                                      class="carousel_content"
                                    />
                                  ) : isVideoLink(slide) ? (
                                    <video
                                      src={slide}
                                      controls
                                      loop
                                      class="carousel_content"
                                    />
                                  ) : (
                                    <h1 class="carousel_content">No media</h1>
                                  )
                                )
                              ) : (
                                <h1>No slides to display</h1>
                              )}
                            </div>
                          </div>
                        </div>
                        <div width="600px">
                          <button onClick={prev}>Prev</button>
                          <button class="right" onClick={next}>
                            Next
                          </button>
                          <h3 class="caption">{post3.caption}</h3>
                          <button
                            className="right"
                            onClick={() => {
                              deletePost(post3.post_id);
                            }}
                          >
                            Delete Post
                          </button>
                          <br />
                        </div>
                        <div className="my-5">
                          <Comment
                            postId={post3.post_id}
                            user_id={post3.user_id}
                          />
                        </div>
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
