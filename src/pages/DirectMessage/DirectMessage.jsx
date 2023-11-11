import { useAuth } from "../../auth/Auth";
import React, { useState, useEffect, useRef } from "react";
import "./DirectMessage.css";
import { io } from "socket.io-client";
let socket;

export default function DirectMessage() {
    const { user } = useAuth();
    const userListLoadedRef = useRef(false);
    var sending = "";

    useEffect(() => {
        if (userListLoadedRef.current) return;
        userListLoadedRef.current = true;
        getFollowers();
        setSocket();
    }, []);

    async function setSocket() {
        socket = await io("http://localhost:3000/", {
            transports: ["websocket", "polling"],
        });

        socket.on(user.id, (arg) => {
            console.log(arg);
        });
        socket.emit("openListen", user.id);

        socket.on("connect_error", (error) => {
            console.error("Connection Error:", error);
        });

        socket.on(user.id, ({ sendId, msg }) => {
            console.log(sendId, msg);
            if (sendId === sending) {
                let tempMessage = document.createElement("p");
                tempMessage.className = "message";
                tempMessage.innerHTML = getUserName(sendId) + ": " + msg;
                document.getElementById("messageContainer").append(tempMessage);
                scrollChatboxToBottom();
                socket.close();
                setSocket();
            }
        });

        socket.onAny((event, ...args) => {
            console.log("Event:", event, "Arguments:", args);
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

            userButton.innerText = username;
            userButton.className = "item1 button";
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
            `http://localhost:3000/getUserName/${userId}`
        );

        const data = await response.json();
        return data["data"][0]["username"];
    }

    async function openChatBox(userName, recievingUserId) {
        await clearDiv("messageContainer");
        sending = recievingUserId;
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
        let message = await document.getElementById("message-input").value;
        console.log(message);

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
        }
    }
    function scrollChatboxToBottom() {
        let msgContainer = document.getElementById("messageContainer");
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    return (
        <main className="ml-0 md:ml-64">
            <div class="container">
                <div class="item item1" id="userList"></div>
                <div class="item item2">
                    <div class="nested-container">
                        <div
                            class="nested-item nested-item1"
                            id="messageContainer"
                        ></div>
                        <div class="nested-item nested-item2">
                            <div class="message-input">
                                <input
                                    type="text"
                                    id="message-input"
                                    placeholder="Type your message..."
                                ></input>
                                <button
                                    id="send-button message-button"
                                    onClick={sendMessage}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
