import { useState, useEffect } from "react";
import Post from "./Post"; // Import the Post component

export default function Home() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/getAllPosts`)
      .then((response) => {
        if (!response.ok) {
          setError(response.statusText);
        }
        return response.json();
      })
      .then((data) => setPosts(data.data))
      .catch((err) => {
        setError(err);
      });
  }, []);

  return (
    <>
      <div className="h-max w-full flex justify-center items-center flex-col gap-5">
        {posts &&
          posts.map((content, key) => (
            <Post key={key} post={content} /> /* Render the Post component for each post */
          )}
        {error && (
          <h1>{error}</h1>
        )}
      </div>
    </>
  );
}
