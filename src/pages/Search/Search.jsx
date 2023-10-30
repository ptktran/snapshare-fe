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
                    <ul className="list">
                        {users.filter((user) =>
                            user.username.toLowerCase().includes(query)).map((user) => (
                            <li key={user.id} className="listItem">{user.username}</li>
                        ))}
                    </ul>

                </div>
                
                <br/>
                <h1 className="text-xl font-bold">Post Search</h1>
                <div class="search_bar">
                    <input type="text" placeholder="Search posts..." className="search" onChange={e => setQuery2(e.target.value)}/>
                    <ul className="list">
                        {posts.filter((post) =>
                            post.caption.toLowerCase().includes(query2)).map((post) => (
                            <li key={post.post_id} className="listItem">{post.caption}</li>
                        ))}
                    </ul>

                </div>
            </div>
        </div>

      </main>
    </>
  )
}
