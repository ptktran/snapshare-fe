import { useAuth, supabase } from "../../auth/Auth";
import React, { useState, useEffect } from 'react';
import './Home.css';
import Carousel from "../../components/Carousel/Carousel";


export default function Home() {


 const { user } = useAuth();
 const [posts, setPosts] = useState([]);

 //get post from users the logged in user is following
 async function getFollowersFeed() {
   try {
     //to Get the IDs of users the logged-in user is following
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
       return;
     }
      const followingIds = followingData.map((follow) => follow.following_id);
      //to Get posts from users the logged-in user is following
     const { data: postsData, error: postsError } = await supabase
       .from('posts')
       .select('*')
       .in('user_id', followingIds)
       .order('post_id', { ascending: false });
      if (postsError) {
       throw postsError;
     }
      if (postsData !== null) {
       setPosts(postsData);
     }
   } catch (error) {
     alert(error.message);
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
              <h1>{post.user_id}</h1>
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


