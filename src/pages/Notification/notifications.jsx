import { useEffect } from 'react'
import { useAuth, supabase } from '../../auth/Auth'
import { useState } from 'react'
import { format } from 'date-fns';

const Notification = () => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        getNotifications()
    }, [notifications])

    const getNotifications = async () => {
        const timestampMilliseconds = new Date().getTime()
        const twoWeeksAgoMilliseconds = timestampMilliseconds - 1209600000;
        const currentDate = new Date(timestampMilliseconds).toISOString();
        const twoWeeksAgo = new Date(twoWeeksAgoMilliseconds).toISOString();
        
        const { data, error } = await supabase
            .from('notification')
            .select('*')
            .eq('interacter_id', user.id)
            .lt('created_at', currentDate)
            .gt('created_at', twoWeeksAgo)
            .order('created_at', { ascending: false })

            if (data) {
                setNotifications(data)
            }
            else {
                console.log(error)
            }
    }

    const convertDate = (date) => {
        const newDate = new Date(date)
        const formattedDate = format(newDate, 'yyyy-MM-dd hh:mm aaa');
        return formattedDate
    }
    return (
        <main className="ml-0 md:ml-64">
            <div className="text-3xl font-bold text-center mt-5">Notifications</div>
            <section className="text-xl grid place-items-center mt-3">
                {notifications.map((notification) => (
                    <div key={notification.id} className="border border-solid border-white mx-10 my-2 py-1 px-1 w-3/5 ">
                        {notification.interaction_type === "follow" ? (
                            <div><a href={notification.profile_link} className="underline underline-offset-2 hover:text-neutral-400">{notification.user_username}</a> is your new follower <div className="float-right inline">{convertDate(notification.created_at)}</div></div>
                        ) : (
                            notification.interaction_type === "like" ? (
                                <div> <a href={notification.profile_link} className="underline underline-offset-2 hover:text-neutral-400">{notification.user_username}</a> liked your <a 
                                    href={notification.post_link} className="underline underline-offset-2 hover:text-neutral-400">post</a> <div className="float-right inline">{convertDate(notification.created_at)}</div> </div>
                            ) : (
                                notification.interaction_type === "comment" ? (
                                    <div> <a href={notification.profile_link} className="underline underline-offset-2 hover:text-neutral-400">{notification.user_username}</a> commented on your <a 
                                    href={notification.post_link} className="underline underline-offset-2 hover:text-neutral-400">post</a> <div className="float-right inline">{convertDate(notification.created_at)}</div></div>
                                ) : (
                                    <div> <a href={notification.profile_link} className="underline underline-offset-2 hover:text-neutral-400">{notification.user_username}</a> sent you a new message <div className="float-right inline">{convertDate(notification.created_at)}</div> </div>
                                )   
                            )   
                        )}
                    </div>
                ))}
            </section>
        </main>
    )
}

export default Notification