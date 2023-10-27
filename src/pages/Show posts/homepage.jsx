import React, { useState, useEffect } from 'react';
import { supabase } from '../../../SupabaseClient';
import Post from './post';

function ShowPost() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // to Fetch posts from the database 
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from('posts').select('*');
        if (error) {
          console.error('Error fetching posts:', error);
        } else {
          setPosts(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="show-post">
      <h1>Latest Posts</h1>
      <div className="post-list">
        {posts.map((post) => (
          <Post key={post.post_id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default ShowPost;