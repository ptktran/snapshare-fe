import React from 'react';

function Post({ post }) {
  return (
    <div className="post">
      {post.type && post.image_url ? (
        post.type.startsWith('image/') ? (
          <img src={post.image_url} alt="Post" />
        ) : (
          <video controls>
            <source src={post.image_url} type={post.type} />
          </video>
        )
      ) : null}
      <p>{post.caption}</p>
    </div>
  );
}

export default Post;
