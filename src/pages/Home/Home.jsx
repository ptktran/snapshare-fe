import { useState, useEffect } from "react"

export default function Home() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:3000/getAllPosts`)
      .then((response) => {
        if (!response.ok) {
          setError(response.statusText)
        }
        return response.json()
      })
      .then((data) => setPosts(data.data))
      .catch((err) => {
        setError(err)
      })
  })
  return (
    <>
      <div className="h-max w-full flex justify-center items-center flex-col gap-5">
        {posts && 
          posts.map((content, key) => (
            <div key={key} className="border flex flex-col">
              <img src={content.image_url}/>
              <h1>{content.caption}</h1>
              <h1>{content.created_at}</h1>
            </div>
        ))}
        {error && (
          <h1>{error}</h1>
        )}
      </div>
    </>
  )
}