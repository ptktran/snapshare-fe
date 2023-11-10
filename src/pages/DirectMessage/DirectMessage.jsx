import { useAuth, supabase } from "../../auth/Auth";
import React, { useState, useEffect } from "react";

const DirectMessage = () => {
    const { user } = useAuth();

    useEffect(() => {
        getFollowers();
    }, []);

    async function getFollowers() {
        const response = await fetch(
            `http://localhost:3000/getFollowingList/08c12617-b892-44e7-9212-5e455b73c063`
        );
        const data = await response.json();
        const list = JSON.stringify(data["data"]);
        document.getElementById("info").innerText = list;
        console.log(data["data"].length);

        for (let i = 0; i < data["data"].length; i++) {
            let userButton = document.createElement("button");
            userButton.innerText = data["data"][i]["following_id"];
            document.getElementById("userList").appendChild(userButton);
            document
                .getElementById("userList")
                .appendChild(document.createElement("br"));
        }
        document
            .getElementById("userList")
            .appendChild(document.createElement("br"));
    }

    return (
        <main className="ml-0 md:ml-64">
            <div id="userList"></div>
            <br></br>
            <div>
                <p id="info"></p>
            </div>
        </main>
    );
};

export default DirectMessage;
