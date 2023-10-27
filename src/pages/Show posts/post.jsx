import React from 'react';

function Post({ post }) { //displaying individual posts
  return (
    <div className="post">
      {post.type.startsWith('image') ? (
        <img src={post.image_url} alt="Post" />
      ) : (
        <video controls>
          <source src={post.image_url} type={post.type} />
         
        </video>
      )}
      <p>{post.caption}</p>
    </div>
  );
}

export default Post;