
import PropTypes from 'prop-types';

function Post({ post }) {
  return (
    <div className="post">
      {post.type.startsWith('image') ? (
        <img src={post.image_url} alt="Post" />
      ) : (
        <video controls>
          <source src={post.image_url} type={post.type} />
          Your browser does not support the video tag.
        </video>
      )}
      <p>{post.caption}</p>
    </div>
  );
}
//added prop type validation using PropTypes.
Post.propTypes = {
  post: PropTypes.shape({
    type: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
  }).isRequired,
};


export default Post;