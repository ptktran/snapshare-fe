import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../../auth/Auth';
import './Comment.css';
import PropTypes from 'prop-types';

function Comment({ postId, user_id }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("")
  const [userData, setUserData] = useState([])
  const [posterUsername, setPosterUsername] = useState("")
  const [errorCode, setErrorCode] = useState()


  //fetch
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments_test')
        .select('id, user_id, comment_text, created_at, updated_at')
        .eq('post_id', postId);

      // if (error) {
      //   console.error('Error fetching comments:', error);
      // } else {
      //   setComments(data);
      // }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    console.log(user_id)
    //fetch usernames
    async function fetchUsernames() {
      try {
        const { data, error } = await supabase
          .from('users123')
          .select('user_id, username');

        if (error) {
          console.error('Error fetching usernames:', error);
        } else {
          const usernameMap = {};
          data.forEach((user) => {
            usernameMap[user.user_id] = user.username;
          });
          setUsernames(usernameMap);
        }
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    }

    fetchComments();
    fetchUsernames();
  }, [postId, editingCommentId]);

  useEffect(() => {
    getPosterUsername()
    fetchUser(posterUsername)
    getUsername()
  },[user_id, posterUsername, userData])

  const handleCommentSubmit = async () => {
    if (!user) {
      alert('You need to be logged in to comment.');
      return;
    }

    if (!commentText) {
      alert('Please enter a comment.');
      return;
    }

    if (editingCommentId !== null) {
      try {
        await supabase
          .from('comments_test')
          .update({
            comment_text: commentText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCommentId);

        // Fetch the updated comments
        await fetchComments();

        setEditingCommentId(null);
        setCommentText('');
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('An error occurred while updating your comment.');
      }
    } else {
      const newComment = {
        user_id: user.id,
        comment_text: commentText,
      };

      setComments((prevComments) => [...prevComments, newComment]);

      try {
        await supabase
          .from('comments_test')
          .upsert([
            {
              post_id: postId,
              user_id: user.id,
              comment_text: commentText,
            },
          ]);

        // Fetch the updated comments 
        await fetchComments();
        setCommentText('');
        sendEmail()
      } catch (error) {
        console.error('Error adding comment:', error);
        alert('An error occurred while adding your comment.');
      }
    }
  };

  const handleEditComment = (commentId, commentText) => {
    setEditingCommentId(commentId);
    setCommentText(commentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentText('');
  };

  const getUsername = async () => {
    const { data, error } = await supabase
    .from('users123')
    .select('username')
    .eq('user_id', user.id)

    if (data) {
      setCurrentUsername(data[0].username)
    }
    if (error) {
      console.log(error)
    }
  }

  const getPosterUsername = async () => {
    const { data, error } = await supabase
    .from('users123')
    .select('username')
    .eq('user_id', user_id)

    if (data) {
      setPosterUsername(data[0].username)
    }
    if (error) {
      console.log(error)
    }
  }

  const fetchUser = async (username) => {
    try {
      await fetch(`http://localhost:3000/getUserInfo/${username}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUserData(data.data[0])
        } else if (data.status === 404) {
          setErrorCode(data.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const sendEmail = async () => {
    var message = "commented on your post on Snapshare.";
    var message2 = "Log into Snapshare to view your commented post.";
    var subject = "Someone Commented on Your Post!";
    const response = await fetch('http://localhost:3000/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: currentUsername, email: userData.email, message: message, message2: message2, subject: subject}),
    })
    if (response.status === 200) {
      console.log("Email sent successfully")
    }

    const { error } = await supabase
    .from('notification')
    .insert([{user_id: user.id, interacter_id: userData.user_id, user_username: currentUsername, interacter_username: userData.username, profile_link: currentUsername, interaction_type: "comment", post_link: `/post/${postId}`}])
    .select()

    if (error) {
      console.log(error)
    }
  }


  return (
    <div className="comment-container">
      <div className="comment-list">
        {comments.map((comment) => (
          <div className="comment" key={comment.id}>
            <span className="comment-user">
              {usernames[comment.user_id] || 'Unknown User'}
            </span>
            {editingCommentId === comment.id ? (
              <>
                <textarea
                  className="textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Edit your comment..."
                />
                <button className="comment-button" onClick={handleCommentSubmit}>
                  Update
                </button>
                <button className="comment-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="comment-text">{comment.comment_text}</p>
                {user && user.id === comment.user_id && (
                  <button
                    className="comment-button"
                    onClick={() => handleEditComment(comment.id, comment.comment_text)}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="comment-input-container">
        <textarea
          className="textarea"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button className="comment-button" onClick={handleCommentSubmit}>
          Post
        </button>
      </div>
    </div>
  );
}

Comment.propTypes = {
  postId: PropTypes.number.isRequired,
  user_id: PropTypes.string,
};

export default Comment;


