import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import ErrorPage from "../Error/ErrorPage"
import { useAuth, supabase} from "../../auth/Auth"


export default function Hashtag() {
    const { user } = useAuth()
    const { username } = useParams()

    // fetch user data and check if account is owned by user
    useEffect(() => {
        const fetchUser = async (username) => {
        try {
            await fetch(`http://localhost:3000/getUserInfo/${username}`)
            .then(response => {
            return response.json()
            }).then(data => {
            if (data.status === 200) {
                if (data.data[0].user_id === user.id) {
                setOwnAccount(true)
                }
                setUserData(data.data[0])
                fetchUserPosts(username)
                setLoading(false)

            } else if (data.status === 404) {
                setErrorCode(data.status)
            }
            })
        } catch (error) {
            console.log(error)
        }
        }
        fetchUser(username)
    }, [username])

    useEffect(() => {
        isFollowing();
        fetchNumberofPosts();
        fetchNumberOfFollowers();
        fetchNumberofFollowing();
    }, [following, userData])
    
    const fetchUserPosts = async (username) => {
        try {
        await fetch(`http://localhost:3000/getUserPosts/${username}`)
        .then(response => {
            return response.json()
        }).then(data => {
            if (data.status === 200) {
            setUserPosts(data.data)
            } else if (data.status === 400) {
            setMsg("No Posts Yet")
            }
        })
        } catch (error) {
        console.log(error)
        }
    }

    // if no post is found return error page, if loading return loading page
    if (errorCode) {
        return <ErrorPage errorCode={errorCode} />;
    } else if (loading) {
        return <Loader />;
    }

    return (
        <>
        <main className="ml-0 md:ml-64">
            {/* header */}
            <h1>Hashtag Results Page</h1>
            <h1>Posts with {hashtag}</h1>
            
            {/* rendering user posts */}
            <section className="flex flex-wrap justify-start py-4 gap-4 w-[800px] m-auto">
            {posts.length >= 1 ? posts.map((post, index) => (
                <Link to={`/post/${post.post_id}`} key={index} className="w-64 h-64 relative group overflow-hidden">
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
            )) : (
                <h1 className="m-auto text-lg text-neutral-600 py-5">{msg}</h1>
            )}
            </section>
        </main>
        </>
    )
}
