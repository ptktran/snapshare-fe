import { useState, useEffect } from "react"
import { useAuth } from "../../../auth/Auth"
import Loader from "../../../components/Loader/Loader"
import ErrorPage from "../../Error/ErrorPage"
import { Link } from "react-router-dom"
import { getDate } from "../../../utils/DateFormatter"
import Modal from "../../../components/Modal/Modal"
import { supabase } from "../../../auth/Auth"

export default function Settings() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState()
  const [userData, setUserData] = useState([])
  const [errorCode, setErrorCode] = useState()
  const [showModal, setShowModal] = useState(false)

  console.log(user)
  console.log(userData)
  
  useEffect(() => {  
    fetchUsername(user.id)
  }, [])

  const fetchUsername = async (userId) => {
    try {
      await fetch(`http://localhost:3000/getUsername/${userId}`)
      .then(response => {
        return response.json()
      }).then(data => {
        if (data.status === 200) {
          setUsername(data.data[0].username)
          fetchUser(data.data[0].username)
        } else if (data.status === 404) {
          setErrorCode(data.status)
        }
      })
    } catch (error) {
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
          setLoading(false)
        } else if (data.status === 404) {
          setErrorCode(data.status)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const deleteUser = async (userid) => {
    await fetch(`http://localhost:3000/deleteUser/${userid}`, {
      method: 'DELETE'
    }).then(response => {
      return response.json()
    }).then(res => {
      console.log(res)
    })
    .catch(error => {
      console.log(error)
    })
    signOut()
  }

  // const test = async () => {
  //   const data = await supabase.from('user_likes').select('post_id').eq('user_id', user.id)
  //   const data2 = await supabase
	// 			.from('likes')
	// 			.select('like_count')
	// 			.eq('post_id', 192)
  //   console.log(data)
  //   console.log(data2)
  // }

  if (errorCode) {
    return <ErrorPage errorCode={errorCode} />
  } else if (loading) {
    return <Loader />
  }

  return (
    <>
      <main className="ml-0 md:ml-64">
        {/* <button onClick={() => test()}>test</button> */}
        <section className="flex flex-col justify-center w-[700px] py-8 m-auto">
          <h1 className="text-lg font-bold mb-2">Account Info</h1>
          <div className="border border-gray w-full p-7">
            <div className="flex items-center gap-4 pb-2">
              {userData.profile_picture_url ? (
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                  <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
                </div>
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                  className="rounded-full w-[50px]" />
              )}
              <div className="leading-tight">
                <h1 className="font-semibold">{username}</h1>
                <Link to={`/${username}`} target="blank" className="text-accent text-sm hover:underline ease duration-150">View profile ↗</Link>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right leading-8 font-semibold">
                <p>Username</p>
                <p>Bio</p>
                <p>Website</p>
                <p>Email</p>
                <p>Date joined</p>
                <p>Provider</p>
              </div>
              <div className="leading-8">
                <p>{userData.username ? userData.username : (<span className="text-neutral-500">Not available</span>)}</p>
                <p>{userData.user_bio ? userData.user_bio : (<span className="text-neutral-500">Not available</span>)}</p>
                <p>{userData.website ? userData.website : (<span className="text-neutral-500">Not available</span>)}</p>
                <p>{user.email}</p>
                <p>{getDate(user.created_at)}</p>
                <p>{user.identities[0].provider.charAt(0).toUpperCase() + user.identities[0].provider.slice(1)}</p>
              </div>
            </div>
            <div className="flex items-center mt-2 gap-2">
              <Link to="/profile" className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray/80 ease duration-150">Back</Link>
              <button onClick={signOut} className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray/80 hover:text-red-400 ease duration-150">Sign out</button>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center w-[700px] m-auto text-sm mb-8">
          <h1 className="text-lg font-bold mb-2">Feedback Hub</h1>
          <div className="flex items-center justify-between border border-gray w-full p-4">
          <Link to="/Form" target="blank" className="text-accent text-sm hover:underline ease duration-150">Share your thoughts or Report issues</Link>
          </div>
        </section>

        <section className="flex flex-col justify-center w-[700px] m-auto text-sm">
          <h1 className="text-lg font-bold mb-2">Danger Zone</h1>
          <div className="flex items-center justify-between border border-gray w-full p-7">
            <div className="flex flex-col">
              <h1 className="font-semibold">Delete this account</h1>
              <p>Once you delete your Snapshare account, there's no going back.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-gray px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-foreground text-red-400 ease duration-150">Delete my account</button>
          </div>
        </section>
        <Modal isVisible={showModal} onClose={() => setShowModal(false)} cancelMsg={"Cancel"} action={() => deleteUser(user.id)} actionMsg={"Proceed"}>
          <header className="w-full rounded-t-xl border-b border-gray p-4">
            <h1 className="font-semibold text-lg">Delete your account?</h1>
          </header>
          <section className="w-full p-6">
            <div className="w-full flex flex-col items-center justify-center py-3 gap-1">
              {userData.profile_picture_url ? (
                <div className="w-[70px] h-[70px] rounded-full overflow-hidden">
                  <img src={userData.profile_picture_url} className="w-full h-full object-cover"/>
                </div>
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" 
                  className="rounded-full w-[70px]" />
              )}
              <h1 className="font-semibold">{username}</h1>
            </div>
            <h1 className="text-sm text-foreground/90 text-justify">This action will be irreversible, you won't be able to restore any messages, posts, or comments. Are you sure you want to proceed?</h1>
          </section>
        </Modal>
      </main>
    </>
  )
}