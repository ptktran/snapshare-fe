import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorPage from "../Error/ErrorPage";
import Carousel from "../../components/Carousel/Carousel";
import { getDate } from "../../utils/DateFormatter";
import Loader from "../../components/Loader/Loader";
import toast, { Toaster } from "react-hot-toast"
import { useAuth, supabase } from '../../auth/Auth';
import './ReportModal.css';

export default function PostPage() {
  const { user } = useAuth();
  const { postId } = useParams()
  const [postData, setPostData] = useState([])
  const [postImages, setPostImages] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState("")
  const [msg, setMsg] = useState("")
  const [username, setUsername] = useState("")
  const [userData, setUserData] = useState([])
  const [errorCode, setErrorCode] = useState()
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState(0);
  const [heartIcon, setHeartIcon] = useState("/icons/heart.svg");
  const [isLiked, setIsLiked] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("")
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  
  useEffect(() => {
    fetchUserPost(postId)
    if (user) {
      checkIfLiked();
    }
    getUsername()
  },[postId])
  
  // fetch post and user info from backend
  const fetchUserPost = async (postId) => {
    try {
      await fetch(`http://localhost:3000/getPost/${postId}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setPostData(data.data[0])
          setPostImages(data.data[0].file_url)
          fetchUserData(data.data[0].user_id)
          fetchComments(postId)
          fetchLikes(postId);
          setLoading(false)
        } else if (data.status === 404) {
          setErrorCode(404)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3000/getComments/${postId}`)
      const data = await response.json()

      if (data.status === 200) {
        const commentsData = data.data

        // Fetch user data for each comment
        const userDataPromises = commentsData.map(comment => fetchUserDataComments(comment.user_id))
        const userDataList = await Promise.all(userDataPromises)

        // Combine comment data with user data
        const combinedData = commentsData.map((comment, index) => ({
          ...comment,
          userData: userDataList[index],
        }))

        setComments(combinedData)
      } else if (data.status === 400) {
        setMsg("No comments yet")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditComment = (commentText, commentId) => {
    setEditingCommentText(commentText)
    setEditingCommentId(commentId)
  }

  const handleCancelCommentEdit = () => {
    setEditingCommentText("")
    setEditingCommentId(null)
  }

  const handlePostComment = async () => {
    if (editingCommentId !== null && editingCommentText.length !== 0) {
      try {
        await supabase
          .from('comments_test')
          .update({
            comment_text: editingCommentText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCommentId);

        // Fetch the updated comments
        await fetchComments(postId);
        toast.success('Your comment has been updated!', { id: 'comment-update-success' })
        setEditingCommentText('');
        setEditingCommentId(null);
      } catch (error) {
        console.error('Error updating comment:', error);
        alert('An error occurred while updating your comment.');
      }
    } else if (editingCommentId !== null && editingCommentText.length === 0) {
      toast.error('Comments cannot be empty, please retry.', { id: 'comment-update-error' })
      return
    } else {
      try {
        const newComment = {
          post_id: postId,
          user_id: user.id,
          comment_text: commentText,
        }
        await supabase
          .from('comments_test')
          .upsert([
            newComment
          ]);

        // Fetch the updated comments 
        await fetchComments(postId);
        toast.success('Your comment has been posted!', { id: 'comment-success' })
        setCommentText('');
      } catch (error) {
        console.error('Error adding comment:', error);
        toast.error('An error occurred while adding your comment', { id: 'comment-error' })
      }
    }
  }

  const handleCommentDelete = async (commentId) => {
    try {
      await supabase
        .from('comments_test')
        .delete()
        .eq('id', commentId);
  
      // Fetch the updated comments after deletion
      await fetchComments(postId);
      setEditingCommentId(null)
      setEditingCommentText("")
      toast.success('Your comment has been deleted!', { id: 'comment-delete' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('An error occurred while deleting your comment', { id: 'comment-delete-error' });
    }
  };

  const fetchUserDataComments = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/getUsernameInfo/${userId}`)
      const data = await response.json()

      if (data.status === 200) {
        return data.data
      } else if (data.status === 404) {
        console.error("User not found")
        return null
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/getUsernameInfo/${userId}`)
      const data = await response.json()

      if (data.status === 200 && data.data.length !== 0) {
        setUsername(data.data[0].username)
        setUserData(data.data[0])
      } else if (data.status === 404) {
        setErrorCode(404)
        console.error("User not found")
        return null
      }
    } catch (error) {
      console.log(error)
    }
  }

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

  const sendEmail = async () => {
    var message = "liked your post on Snapshare.";
    var message2 = "Log into Snapshare to view your liked post.";
    var subject = "Someone Liked Your Post!";
    
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
    .insert([{user_id: user.id, interacter_id: userData.user_id, user_username: currentUsername, interacter_username: userData.username, profile_link: currentUsername, interaction_type: "like", post_link: `/post/${postId}`}])
    .select()

    if (error) {
      console.log(error)
    }
  }
  
  // Get the posts likes from supabase
  const fetchLikes = async (postId) => {
    const { data, error } = await supabase
      .from('likes') 
      .select('like_count')
      .eq('post_id', postId)
      .single();
  
    if (error) {
      console.log('Error fetching likes:', error);
    } else {
      setLikes(data ? data.like_count : 0); 
    }
  };

  // Check if user liked and update the heart accordingly
  const checkIfLiked = async () => {
    const { data, error } = await supabase
      .from('user_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id);
  
    if (error) {
      console.error('Error fetching like status:', error);
    } else {
      const liked = data && data.length > 0;
      setIsLiked(liked);
      setHeartIcon(liked ? "/icons/heart-filled.png" : "/icons/heart.svg");
    }
  };

  // Toggle like/unlike the post
  const toggleLike = async () => {
    // Check if the user is trying to like their own post
    if (user.id === postData.user_id) {
    console.log("Cannot like your own post.");
    return; // Stop the function from proceeding further
    }

    let newLikes = isLiked ? likes - 1 : likes + 1;
    setIsLiked(!isLiked);
    setLikes(newLikes);
    setHeartIcon(!isLiked ? "/icons/heart-filled.png" : "/icons/heart.svg");
    
    if (isLiked) {
      // User is unliking the post
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .match({ user_id: user.id, post_id: postId });
      if (error) {
        console.error('Error unliking the post:', error);
      } else {
        // Only update state if the unliking was successful
        setLikes(newLikes);
        setIsLiked(false);
        setHeartIcon("/icons/heart.svg");
      }
    } else {
      // User is liking the post
      const { error } = await supabase
        .from('user_likes')
        .insert({ user_id: user.id, post_id: postId });
      if (error) {
        console.error('Error liking the post:', error);
      } else {
        // Only update state if the liking was successful
        setLikes(newLikes);
        setIsLiked(true);
        setHeartIcon("/icons/heart-filled.png");
        sendEmail()
      }
    }

    // Attempt to update the like count in the 'likes' table regardless of like/unlike
    const { error: likesError } = await supabase
      .from('likes')
      .upsert({ post_id: postId, like_count: newLikes }, { onConflict: 'post_id' });
    if (likesError) {
      console.error('Error updating like count:', likesError);
      // If there was an error updating the like count, revert the state changes
      setLikes(likes); // revert back to original likes
      setIsLiked(!isLiked); // revert the isLiked state
      setHeartIcon(isLiked ? "/icons/heart-filled.png" : "/icons/heart.svg"); // revert the icon
    }
  };

  // Pop up for report
  const toggleReportModal = () => {
    setShowReportModal(!showReportModal);
  };

  // Reporting posts
  const submitReport = async () => {
    // Check if a reason is selected or not
    if (!reportReason || (reportReason === 'other' && !customReason)) {
      console.log('No report reason selected');
      return; 
    }
    const reasonToSubmit = reportReason === 'other' && customReason ? customReason : reportReason;
    const { data, error } = await supabase
      .from('reports')
      .insert([
        { post_id: postId, report_reason: reasonToSubmit, user_id: user.id }
      ]);
    if (error) {
      console.error('Error submitting report:', error);
    } else {
      console.log('Report submitted:', data);
      setCustomReason('');
      setReportReason('');
      toggleReportModal(); 
    }
  };

  // Report Modal Component
  const ReportModal = () => {
    // Input ref to maintain focus on text field
    const inputRef = React.useRef(null);
    // Effect to focus input when "Other" is selected
    React.useEffect(() => {
      if (reportReason === 'other') {
        inputRef.current.focus();
      }
    }, [reportReason]);

    return (
      <div className="report-modal-backdrop">
        <div className="report-modal-content">
          <h2>Report Post</h2>
          <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="report-select">
            <option value="" disabled hidden>Select a Reason</option>
            <option value="spam">It's spam</option>
            <option value="inappropriate">It's inappropriate</option>
            <option value="abusive">It's abusive or harmful</option>
            <option value="false information">It contains false information</option>
            <option value="off topic">It's off-topic</option>
            <option value="other">Other</option>
          </select>
          {reportReason === 'other' && (
            <input
              ref={inputRef} // Attach the ref to the input
              type="text"
              placeholder="Please specify..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="custom-reason-input"
            />
          )}
          <div>
            <button onClick={submitReport}>Submit Report</button>
            <button onClick={toggleReportModal}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };



  // if no post is found return error page, if loading return loading page
  if (errorCode) {
    return <ErrorPage errorCode={errorCode} />
  } else if (loading) {
    return <Loader />
  }

  return (
    <>
      <main className="ml-0 md:ml-64 flex justify-center items-start pt-7">
        <Toaster toastOptions={{
          duration: 2000,
        }}/>
        <div className="w-[850px] h-[650px] flex items-center">
          {/* render image carousel */}
          {postImages ? (
            <Carousel images={postImages} cover={false}/>
          ) : (<h1>An error has occured, please try again later.</h1>)}
          {/* banner with username, profile pic and date */}
          <section className="w-[450px] border border-gray h-full flex flex-col justify-between">
            <Link to={`/${username}`} className="h-[50px] border-b border-gray flex items-center justify-between p-3 hover:text-foreground/80 ease duration-150">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray">
                  {userData.profile_picture_url ? (
                    <img src={userData.profile_picture_url} className="object-cover h-full w-full"/>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" className="object-cover h-full w-full"/>
                  )}
                </div>
                <h1 className="font-semibold text-sm">{username}</h1>
              </div>
              <h1 className="text-xs font-light text-neutral-400">{getDate(postData.updated_at)}</h1>
            </Link>

            {/* rendering caption */}
            <div className="h-full w-full text-sm flex-col flex gap-2 items-start justify-start p-3 overflow-y-auto">
              <div className="flex gap-2 w-full pb-1.5">
                <Link to={`/${username}`} className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden border border-gray">
                  {userData.profile_picture_url ? (
                    <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
                  ) : (
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" className="w-full h-full object-cover"/>
                  )}
                </Link>
                <div className="leading-none w-full break-words">
                  <Link to={`/${username}`} className="font-semibold text-sm hover:text-foreground/80 ease duration-150">{username}</Link>
                  <h1 className="min-w-0">{postData.caption}</h1>
                </div>
              </div>
              {comments.length !== 0 && comments.map((comment, index) => (
                <div className="flex gap-2 w-full py-1.5" key={index}>
                  <Link to={`/${comment.userData[0].username}`} className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden border border-gray">
                    {comment.userData[0].profile_picture_url ? (
                      <img src={comment.userData[0].profile_picture_url} className="w-full h-full object-cover"/>
                    ) : (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" className="w-full h-full object-cover"/>
                    )}
                  </Link>
                  <div className="leading-none w-full break-words">
                    <Link to={`/${comment.userData[0].username}`} className="flex justify-between items-center gap-2 font-semibold text-sm hover:text-foreground/80 ease duration-150">{comment.userData[0].username} <p className="text-xs font-light text-neutral-400">{getDate(comment.created_at)}</p></Link>
                    {(comment.userData[0].user_id !== user.id || comment.id !== editingCommentId) && (
                      <h1 className="min-w-0">{comment.comment_text}</h1>
                    )}
                    {comment.userData[0].user_id === user.id && (
                      <div className="flex items-center gap-2 pt-1 text-neutral-400 font-semibold">
                        {editingCommentId === comment.id ? (
                          <div className="flex items-center flex-col">
                            <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)}
                              className="bg-gray background w-full resize-none text-sm font-normal p-2 outline-none text-foreground rounded-lg"
                            ></textarea>
                            <div className="flex items-center gap-2 w-full">
                              <button className="text-accent hover:text-accent/80 ease duration-150 text-xs" onClick={handlePostComment}>Confirm Edit</button>
                              <button className="text-neutral-400 hover:text-neutral-400/80 duration-150 text-xs" onClick={handleCancelCommentEdit}>Cancel</button>
                              <button onClick={() => handleCommentDelete(comment.id)} className="hover:text-neutral-500 ease duration-150 text-sm"><i className="bx bx-trash-alt"></i></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button className="hover:text-neutral-500 ease duration-150 text-xs" onClick={() => handleEditComment(comment.comment_text, comment.id)}>Edit</button>
                            <button onClick={() => handleCommentDelete(comment.id)} className="hover:text-neutral-500 ease duration-150 text-sm"><i className="bx bx-trash-alt"></i></button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Div for likes, date and report icon */}
            <div className="flex justify-between items-start p-3 min-h-[60px] border-t border-gray">
              <div className="flex flex-col">
                {/* Like button and likes count */}
                <div className="flex items-center">
                  <button onClick={toggleLike}>
                    <img src={heartIcon} className="w-7"/>
                  </button>
                  <span className="text-sm font-medium pl-2">{likes} likes</span>
                </div>
                {/* Date */}
                <span className="text-xs font-light text-neutral-400 pt-1">{getDate(postData.updated_at)}</span>
              </div>

              {/* Report button */}
              <button onClick={toggleReportModal} className="report-flag-btn">
                <img src="/icons/report.png" alt="Report" />
              </button>
            </div>

            {/* Comment input section */}
            <div className="flex items-center p-2.5 min-h-[50px]">
              <input placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="bg-background w-full text-sm p-1 outline-none"></input>
              <button onClick={handlePostComment} disabled={!commentText.trim() || editingCommentId !== null} 
                className={`text-accent font-medium text-sm hover:text-accent/80 ease duration-150 ml-2 ${(!commentText.trim() || editingCommentId !== null) && 'text-gray hover:text-gray'}`}>Post</button>
            </div>
          </section>
        </div>
      </main>
      {/* Conditionally render the Report Modal */}
      {showReportModal && <ReportModal />}
    </>
  );
}