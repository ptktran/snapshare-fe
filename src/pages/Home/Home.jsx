import { useAuth, supabase } from "../../auth/Auth";
import React, { useState, useEffect } from 'react';
import './Home.css';
import Carousel from "../../components/Carousel/Carousel";


export default function Home() {


 const { user } = useAuth();
 const [posts, setPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 //get post from users the logged in user is following
 async function getFollowersFeed() {
  try {
    // Get the IDs of users the logged-in user is following
    const { data: followingData, error: followingError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id);

    if (followingError) {
      throw followingError;
    }

    if (!followingData || followingData.length === 0) {
      // No users followed by the logged-in user
      setPosts([]);
      setLoading(false);
      return;
    }

    const followingIds = followingData.map((follow) => follow.following_id);

    // Get posts from users the logged-in user is following
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('user_id', followingIds)
      .order('post_id', { ascending: false });

    if (postsError) {
      throw postsError;
    }

    // Get usernames
    const { data: usernamesData, error: usernamesError } = await supabase
      .from('users123')
      .select('user_id, username');

    if (usernamesError) {
      throw usernamesError;
    }

    // Map usernames to user_id 
    const usernameMap = {};
    usernamesData.forEach((user) => {
      usernameMap[user.user_id] = user.username;
    });

    // Combine postsData with usernames
    const postsWithUsernames = postsData.map((post) => ({
      ...post,
      username: usernameMap[post.user_id] || 'Unknown User',
    }));

    setPosts(postsWithUsernames);
    setLoading(false);
  } catch (error) {
    setError(error.message || 'An error occurred');
    setLoading(false);
  }
}
 
  useEffect(() => {
   getFollowersFeed();
 }, [user]);


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
    <main className="ml-0 md:ml-64">
      <div className="content-container p-9 w-full">
        <div className="post-container">
          <h1 className="text-3xl font-bold text-left">Home</h1>
          {posts && posts.map((post) => (
            <div key={post.post_id} className="post_block">
            <h1>{post.username}</h1>
              <div>
                {post.file_url ? (
                  isImageLink(post.file_url[0]) || isVideoLink(post.file_url[0]) ? (
                    <Carousel images={post.file_url} cover={false} />
                  ) : (
                    <h1>No media</h1>
                  )
                ) : (
                  <h1>No media</h1>
                )}
                <br />
              </div>
              <h2>Post Caption: {post.caption}</h2>
            </div>
          ))}
          {posts.length === 0 && (
            <div>
              <h1 className="text-neutral-500">No posts to show yet...</h1>
            </div>
          )}
        </div>
      </div>
    </main>
  </>
);
}

