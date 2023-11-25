import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth, supabase } from "../../auth/Auth";

export default function Hashtag() {
    const { user } = useAuth();
    const { hashtag } = useParams(); // extract the hashtag from the URL
    const [posts, setPosts] = useState([]);
    const [hashtags, setHashtags] = useState([]);
  
    // get posts
    async function getPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("post_id", { ascending: false }); // recent post first
  
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
  
    function isImage(url) {
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i;
      return imageExtensions.test(url);
    }
  
    // Filter posts based on the hashtag
    const filteredPosts = posts.filter(post => post.caption.includes(`#${hashtag}`));
  
    return (
      <>
        <main className="ml-0 md:ml-64">
          <div className="content-container">
            <div className="content-container p-9 block">
              {/* header */}
              <h1 className="text-3xl font-bold text-center">Hashtag Results Page</h1>
              <br />
              <h1 className="text-xl font-bold">Posts with #{hashtag}</h1>
  
              {/* rendering user posts */}
              <section className="flex flex-wrap justify-start py-4 gap-4 w-[800px] m-auto">
                {filteredPosts.length >= 1 ? (
                  filteredPosts.map((post, index) => (
                    <Link to={`/post/${post.post_id}`} key={post.post_id} className="w-64 h-64 relative group overflow-hidden">
                        {post.file_url && post.file_url[0] ? (
                            isImage(post.file_url[0]) ? (
                            <img src={post.file_url[0]} className="w-full h-full object-cover" alt="Post Thumbnail" />
                            ) : (
                            <video src={post.file_url[0]} className="w-full h-full object-cover" alt="Post Thumbnail" />
                            )
                        ) : (
                            <p>No media available</p>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 duration-100 transition-opacity flex items-center justify-center"/>
                    </Link>
                  ))
                ) : (
                  <h1 className="m-auto text-lg text-neutral-600 py-5">No Posts Yet</h1>
                )}
              </section>
            </div>
          </div>
        </main>
      </>
    );
  }
  
