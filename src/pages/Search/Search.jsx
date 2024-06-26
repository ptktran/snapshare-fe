import { useAuth, supabase } from "../../auth/Auth";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Search.css";
import Comment from "../Profile/Content/Comment";
import { getDate } from "../../utils/DateFormatter";

export default function Search() {
  const { userA } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [post2, setPost2] = useState([]);
  const [query, setQuery] = useState("");
  const [query2, setQuery2] = useState("");
  const [query3, setQuery3] = useState("");
  const [hashtags, setHashtags] = useState([]);

  // Gets the user profile
  async function getUsers() {
    try {
      const { data, error } = await supabase.from("users123").select("*");

      if (error) throw error;

      if (data != null) {
        setUsers(data);
      }
    } catch (error) {
      alert(error.essage);
    }
  }

  //get posts
  async function getPosts() {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("post_id", { ascending: false }); //recent post first

      if (error) throw error;

      if (data != null) {
        setPosts(data);

        // Extract hashtags from post captions
        const allHashtags = data.reduce((hashtagsArray, post) => {
          var regexp = /#(\w+)/g;
          let result;

          while ((result = regexp.exec(post.caption)) !== null) {
            // result[0] contains the entire match, result[1] contains the first capturing group
            hashtagsArray.push(result[1]);
          }
          return hashtagsArray;
        }, []);

        setHashtags(Array.from(new Set(allHashtags))); // Remove duplicates
      }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    getUsers();
    getPosts();
  }, []);

  //pop up form
  function openImg(postId) {
    document.getElementById("imagePop").style.display = "block";
    posts.map((post) => {
      if (post.post_id == postId) {
        setPost2({
          post_id: post.post_id,
          user_id: post.user_id,
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

  //image carousel
  var slides;
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

  return (
    <>
      <main className="ml-0 md:ml-64 overflow-hidden">
        <div className="h-fit flex justify-center pt-7 pb-[80px] md:pb-[30px] md:p-9 w-full">
          <div className="w-full flex items-center justify-center flex-col">
            {/* User Search */}
            <h1 className="text-3xl font-bold text-center">Search Page</h1>
            <div class="search_bar w-full md:w-[500px]">
              <h1 className="text-xl font-bold w-full md:w-[500px] py-2">
                User Search
              </h1>
              <input
                type="text"
                placeholder="Search users..."
                className="w-full md:w-[500px] rounded p-2.5"
                onChange={(e) => setQuery(e.target.value)}
              />
              <div class="search_results w-full md:w-[500px]">
                <ul className="list">
                  {users
                    .filter((user) =>
                      user.username.toLowerCase().includes(query)
                    )
                    .map((user) => (
                      <Link to={`/${user.username}`}>
                        <li key={user.user_id} className="listItem">
                          <span>{user.username}</span>
                        </li>
                      </Link>
                    ))}
                </ul>
              </div>
            </div>

            {/* Hashtag Search */}
            <div class="search_bar w-full md:w-[500px]">
              <h1 className="text-xl font-bold w-full md:w-[500px] py-2">
                Hashtag Search
              </h1>
              <input
                type="text"
                placeholder="Search posts with hashtags..."
                className="w-full md:w-[500px] rounded p-2.5"
                onChange={(e) => setQuery3(e.target.value)}
              />

              <div className="search_results w-full md:w-[500px]">
                <ul className="list">
                  {hashtags
                    .filter((hashtag) => hashtag.toLowerCase().includes(query3))
                    .map((hashtag) => (
                      <Link to={`/hashtag/${hashtag}`}>
                        <li className="listItem" key={hashtag}>
                          <span>{hashtag}</span>
                        </li>
                      </Link>
                    ))}
                </ul>
              </div>
            </div>

            {/* Post Search */}
            <div class="search_bar w-full md:w-[500px]">
              <h1 className="text-xl font-bold w-full md:w-[500px] py-2">
                Post Search
              </h1>
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full md:w-[500px] rounded p-2.5"
                onChange={(e) => setQuery2(e.target.value)}
              />
              <div class="search_results w-full md:w-[500px]">
                <ul className="list">
                  {posts
                    .filter((post) =>
                      post.caption.toLowerCase().includes(query2)
                    )
                    .map((post) => (
                      <div>
                        <li
                          key={post.post_id}
                          className="listItem"
                          onClick={() => {
                            openImg(post.post_id);
                          }}
                        >
                          {post.caption}
                        </li>

                        {/* <Comment postId={post.post_id} user_id={post.user_id} /> */}

                        {/* Popup image */}
                        <div
                          class="popup w-full h-full md:w-[700px] md:h-[700px]"
                          id="imagePop"
                        >
                          <button
                            onClick={() => {
                              closeImg();
                            }}
                          >
                            &times;
                          </button>

                          <div class="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] rounded-full">
                                <img
                                  src="https://cdn141.picsart.com/357697367045201.jpg"
                                  class="profile_image"
                                />
                              </div>
                              <div className="flex flex-col">
                                <h3 className="hidden md:block">
                                  {post2.user_id}
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

                          {/* Image Carousel */}
                          <div class="center">
                            <div class="carousel_container w-full md:w-[600px]">
                              {/* Image Carousel in edit */}
                              {getSlides(post2.file_url)}

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
                            <h3 class="caption">{post2.caption}</h3>
                            <br />
                          </div>

                          <Comment
                            postId={post2.post_id}
                            user_id={post2.user_id}
                          />
                        </div>
                      </div>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
