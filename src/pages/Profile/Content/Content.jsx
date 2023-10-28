// Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/Auth';
import './Content.css';
import { createClient } from "@supabase/supabase-js"


// supabase database
const supabaseUrl = 'https://cmknbeginwvrwzxmgdgy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNta25iZWdpbnd2cnd6eG1nZGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc4MjUwNjEsImV4cCI6MjAxMzQwMTA2MX0.k50TFr8xKAoU8_XKszvFs7WHkyhdGeM0bGfYzt4LG38';
const supabase = createClient(supabaseUrl, supabaseKey);


// default function
export default function Content() {
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [createButtonClicked, setCreateButtonClicked] = useState(false);


  // Edit mode + handling changes
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  const handleBioChange = (e) => {
    const newBio = e.target.value;
    setBio(newBio);
  };
  const handleImageInput = (e) => {
    const imageUrl = e.target.value;
    setProfileImage(imageUrl);
  };
  const handleWebsiteChange = (e) => {
    const newWebsite = e.target.value;
    setWebsite(newWebsite);
  };
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };


  useEffect(() => {
    fetchUserProfile(); 
  }, []);


  // Gets the user profile 
  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('users123')
      .select()
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    if (data.length > 0) {
      const user = data[0];
      setUsername(user.username);
      setBio(user.user_bio);
      setProfileImage(user.profile_picture_url || '');
      setWebsite(user.website || '');
    }
  };


  // Creates a profile 
  async function createProfile() {
    try {
      const { error } = await supabase
        .from('users123')
        .upsert([
          {
            user_id: user.id,
            username,
            email: user.email,
            user_bio: bio,
            profile_picture_url: profileImage,
            website,
          },
        ]);
      if (error) {
        throw error;
      }
      setIsEditing(false);
      setCreateButtonClicked(true);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }



  // Edits the profile
  const handleSave = async () => {
    try {
      if (user.id) {
        const userProfile = {
          username,
          user_bio: bio,
          profile_picture_url: profileImage,
          website,
        };
        await supabase.from('users123').update(userProfile).eq('user_id', user.id);
        setIsEditing(false);
      } else {
        throw new Error('No user_id found. Cannot update the profile.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };



  // Formatting + Buttons
  return (
    <div className="page-container"> 
      <div className="content-container">
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-left">
            <div className="profile-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
              <div className="profile-image-placeholder">
                <img src="https://cdn141.picsart.com/357697367045201.jpg" alt="Profile" className="profile-image" />
              </div>
            )}
          </div>
        </div>
        <div className="profile-right">
          {isEditing ? (
            <div className="edit-profile-modal">
              <div className="edit-profile-input">
                <label htmlFor="bio">Edit Bio (max 50 characters):</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={handleBioChange}
                  maxLength={50}
                  autoComplete="off"
                />
                <p>Current Bio: {bio}</p> {/* Display current bio as you type */}
              </div>
              <div className="edit-profile-input">
                <label htmlFor="profile-image">Change Profile Photo:</label>
                <input
                  type="url"
                  id="profile-image"
                  value={profileImage}
                  onChange={handleImageInput}
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="website">Edit External Website:</label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={handleWebsiteChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="edit-profile-input">
                <label htmlFor="username">Edit Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="edit-button-container">
              {!createButtonClicked ? ( 
                <button className="standout create-button" onClick={createProfile}>
                  Create Profile
                </button>
              ) : (
                <button className="standout save-button" onClick={handleSave}>
                  Save
                </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="username-tab">
                <p>{username}</p>
              </div>
              <button className="standout edit-button" onClick={toggleEditing}>
                Edit Profile
              </button>
              <div className="displayed-items">
                {bio ? (
                  <p>{bio}</p>
                ) : (
                  <p>null</p>
                )}
                {website && (
                  <p>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {website}
                    </a>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Conditional rendering for the line and "Posts," "Saved," and "Tagged" buttons */}
      {!isEditing && (
        <>
          <div className="profile-line"></div>
          <div className="profile-buttons">
            <button className="profile-button">⊞ Posts</button>
            <button className="profile-button">▽ Saved</button>
            <button className="profile-button">🏳 Tagged</button>
          </div>
        </>
      )}
    </div>
    </div>
  </div> 
  );
}
