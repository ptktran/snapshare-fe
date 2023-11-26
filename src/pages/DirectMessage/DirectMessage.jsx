import { useAuth } from "../../auth/Auth";
import React, { useState, useEffect, useRef } from "react";
import "./DirectMessage.css";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
let socket;

export default function DirectMessage() {
    const { user } = useAuth();
    const userListLoadedRef = useRef(false);
    const [sending, setSending] = useState("");
    const [username, setUsername] = useState("")
    const [sendingUsername, setSendingUsername] = useState("")
    const socketRef = useRef();
    const [emailNotificationStatus, setEmailNotificationStatus] = useState(true); 

    useEffect(() => {
        if (userListLoadedRef.current) return;
        userListLoadedRef.current = true;
        getFollowers();
        setSocket();
        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    async function setSocket() {
        socket = await io("http://localhost:3000/", {
            transports: ["websocket", "polling"],
            reconnection: false,
        });

        socket.on(user.id, (arg) => {
            console.log(arg);
        });
        socket.emit("openListen", user.id);

        socket.on("connect_error", (error) => {
            console.error("Connection Error:", error);
        });

        socket.on(user.id, async ({ sendId, msg }) => {
            console.log(sendId, msg);
            if (sendId === sending) {
                const userName = await getUserName(sendId);
                console.log(userName);
                let tempMessage = document.createElement("p");
                tempMessage.className = "message";
                tempMessage.innerHTML = userName + ": " + msg;
                document.getElementById("messageContainer").append(tempMessage);
                scrollChatboxToBottom();
                socket.close();
                setSocket();
            }
        });
    }
    async function getFollowers() {
        const response = await fetch(
            `http://localhost:3000/getFollowingList/${user.id}`
        );

        const data = await response.json();

        for (let i = 0; i < data["data"].length; i++) {
            let followingUsersId = data["data"][i]["following_id"];
            let userButton = await document.createElement("button");
            let username = await getUserName(followingUsersId);
            setUsername(await getUserName(user.id))

            userButton.innerText = username;
            userButton.className = `button ${sending === followingUsersId ? "selected" : ""}`;
            userButton.onclick = () => openChatBox(username, followingUsersId);
            await document.getElementById("userList").appendChild(userButton);
            document
                .getElementById("userList")
                .appendChild(document.createElement("br"));
            scrollChatboxToBottom();
        }
    }

    async function getUserName(userId) {
        const response = await fetch(
            `http://localhost:3000/getUsername/${userId}`
        );

        const data = await response.json();
        return data["data"][0]["username"];
    }

    async function openChatBox(userName, recievingUserId) {
        await clearDiv("messageContainer");
        setSending(recievingUserId);
        const sendingUser = await getUserName(recievingUserId)
        setSendingUsername(sendingUser)
        
        const response = await fetch(
            `http://localhost:3000/getMessages/${recievingUserId}`
        );

        const data = await response.json();
        const messages = await data["data"];

        for (let i = 0; i < messages.length; i++) {
            if (
                messages[i].recievingUserId === user.id &&
                messages[i].sendingUserId === recievingUserId
            ) {
                let tempMessage = await document.createElement("p");
                tempMessage.className = "message";
                tempMessage.innerHTML =
                    "" + userName + ": " + messages[i].message;
                document
                    .getElementById("messageContainer")
                    .appendChild(tempMessage);
            } else if (
                messages[i].recievingUserId === recievingUserId &&
                messages[i].sendingUserId === user.id
            ) {
                let tempMessage = await document.createElement("p");
                tempMessage.className = "message";
                tempMessage.innerHTML =
                    (await getUserName(user.id)) + ": " + messages[i].message;
                document
                    .getElementById("messageContainer")
                    .appendChild(tempMessage);
            }
        }
        scrollChatboxToBottom();
    }

    async function clearDiv(id) {
        document.getElementById(id).innerHTML = "";
    }

    async function sendMessage() {
        let messageInput = document.getElementById("message-input");
        let message = await document.getElementById("message-input").value;

        if (socket && sending != "") {
            let tempMessage = await document.createElement("p");
            tempMessage.className = "message";
            tempMessage.innerHTML =
                (await getUserName(user.id)) + ": " + message;
            document.getElementById("messageContainer").append(tempMessage);
            scrollChatboxToBottom();
            socket.emit(user.id, { sendId: sending, msg: message });
            socket.close();
            setSocket();
            messageInput.value = "";
        }
    }
    function scrollChatboxToBottom() {
        let msgContainer = document.getElementById("messageContainer");
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
//////////////////////////////////////////////////////////////////////////////
async function updateEmailNotificationStatus(newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/updateEmailNotificationStatus/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_notification_status: newStatus }),
        });

        const data = await response.json();
        console.log(data);

        // Update the emailNotificationStatus
        setEmailNotificationStatus(newStatus);
        
    } catch (error) {
        console.error("Error updating email notification status:", error);
    }
}
    return (
        <main className="ml-0 md:ml-64">
            <div class="container">
                <div class="item item1" id="userList">
                  <h1 className="text-xl font-semibold py-2 mb-3 border-b border-gray">Inbox</h1>

                   {/*Email Notification Status */}
                <button
                    id="toggle-email-notification-button"
                    className="text-accent hover:text-accent/80 ease duration-150 font-semibold text-lg"
                    onClick={() => updateEmailNotificationStatus(!emailNotificationStatus)}
                >
                    {emailNotificationStatus ? "Disable Email Notifications" : "Enable Email Notifications"}
                </button>

                </div>
                <div class="item item2">
                    <div class="nested-container">
                        {username && (
                            <>
                                {sendingUsername && 
                                    (<Link 
                                      className="border border-gray rounded-lg font-semibold px-5 py-3 hover:text-foreground/80 duration-150 ease"
                                      to={`/${sendingUsername}`}>{sendingUsername}</Link>)}
                            </>
                        )}
                        <div
                            class="nested-item nested-item1"
                            id="messageContainer"
                        >
                        </div>
                        <div class="nested-item nested-item2">
                            {sending && (
                              <div class="message-input">
                                  <input
                                      type="text"
                                      id="message-input"
                                      placeholder="Type your message..."
                                  ></input>
                                  <button
                                      id="send-button message-button"
                                      className="text-accent hover:text-accent/80 ease duration-150 font-semibold text-lg"
                                      onClick={sendMessage}
                                  >
                                      Send
                                  </button>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
