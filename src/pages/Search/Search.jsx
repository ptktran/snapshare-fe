import { useAuth, supabase } from "../../auth/Auth";
import React, { useState, useEffect } from 'react';
import './Search.css'

export default function Search() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [query, setQuery] = useState("");
    const [query2, setQuery2] = useState("");

    // Gets the user profile 
    async function getUsers() {
        try {
            const { data, error } = await supabase
            .from('users123')
            .select('*');

            if (error) throw error;
            
            if (data != null) {
                setUsers(data);
            }
        } catch (error) {
            alert(error.essage);
        }
    }

    async function getPosts() {
        try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('post_id', { ascending:false });     //recent post first
    
        if (error) throw error;
    
        if (data != null) {
            setPosts(data);
        }
        } catch (error) {
          alert(error.message);
        }
      }

    useEffect(() => {
        getUsers(); 
        getPosts();
    }, [])

    return (
    <>
      <main className="ml-0 md:ml-64">
        <div class="content-container">
            <div class="content-container p-9 block">

                <h1 className="text-3xl font-bold text-center">Search Page</h1>
                <br/>
                <h1 className="text-xl font-bold">User Search</h1>
                <div class="search_bar">
                    <input type="text" placeholder="Search users..." className="search" onChange={e => setQuery(e.target.value)}/>
                    <div class="search_results">
                        <ul className="list">
                            {users.filter((user) =>
                                user.username.toLowerCase().includes(query)).map((user) => (
                                <li key={user.id} className="listItem">
                                    <a href="#">{user.username}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
                
                <br/>
                <h1 className="text-xl font-bold">Post Search</h1>
                <div class="search_bar">
                    <input type="text" placeholder="Search posts..." className="search" onChange={e => setQuery2(e.target.value)}/>
                    <div class="search_results">
                        <ul className="list">
                            {posts.filter((post) =>
                                post.caption.toLowerCase().includes(query2)).map((post) => (
                                <div>
                                    <li key={post.post_id} className="listItem">
                                        <a href="#">{post.caption}</a>
                                    </li>
                                {/*  d  
                                    {/* Popup image        
                                    <div class="popup" id="imagePop">
                                        <button onClick={()=>{closeImg()}}>&times;</button>

                                        <div class="flex">
                                            <div>
                                                {profileImage ? (
                                                    <img src={profileImage} class="profile_image" />
                                                    ) : (
                                                    <div className="profile-image-placeholder">
                                                    <img src="https://cdn141.picsart.com/357697367045201.jpg" class="profile_image" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="block">
                                                <h3>{username}</h3>
                                                <p class="right">{post3.created_at}</p>
                                            </div>
                                        </div>
                                    
                                        {/* Image Carousel    
                                        <div class="center"> 
                                            <div class="carousel_container">
                                                {/* Image Carousel in edit
                                                {getSlides(post.file_url)}
                                            
                                                <div class="carousel" style={{ transform: `translateX(-${curr * 100}%)` }}>
                                                {Array.isArray(slides) ? (
                                                    slides.map((slide) => (
                                                    isImageLink(slide) ? (
                                                        <img src={slide} alt="Image" class="carousel_content"/>
                                                    ) : isVideoLink(slide) ? (
                                                        <video src={slide} controls loop class="carousel_content" />
                                                    ) : (
                                                        <h1 class="carousel_content">No media</h1>
                                                    )
                                                    ))
                                                ) : (
                                                    <h1>No slides to display</h1>
                                                )}
                                                </div>
                                            </div> 
                                        </div>  
                                        <div width="600px">
                                            <button onClick={prev}>Prev</button>  
                                            <button class="right" onClick={next}>Next</button>                                          
                                            <h3 class="caption">{post.caption}</h3>
                                            <button class="right" onClick={()=>{deletePost(post3.post_id)}}>Delete Post</button>
                                            <br/>
                                        </div>
                                    </div>
                                */}
                                </div>   
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>

      </main>
    </>
  )
}
