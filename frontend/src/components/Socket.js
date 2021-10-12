import React, { useState, useEffect } from "react";
import io from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:5000";

function App() {
    const [threads, setThreads] = useState([])

    useEffect(() => {
        const socket = io(ENDPOINT);

        socket.on("post", data => {
            setThreads(threads => [data, ...threads])
        })
        
        socket.on("comment", data => {
            setThreads(threads => [data, ...threads])
        })

    }, []);

    useEffect(() => {
        console.log(threads)
    }, [threads])

    // Turn thread informations into thread elements
    const postElements = threads.map(thread => (
        RedditPost(thread)
    ))

    return (
        <div>
            {postElements}
        </div>
        
    );
}

function RedditPost({ title, body, author, subreddit }) {
    return (
        <div key={body}>
            <div>{title}</div>
            <div>{body}</div>
            <div>r/{subreddit}</div>
            <div>u/{author}</div>
        </div>
    )
}

export default App;