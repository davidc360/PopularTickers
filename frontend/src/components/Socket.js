import './Socket.sass'

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
        <div className='threadsCtn'>
            {postElements}
            {RedditPost({
                title: 'Post Title',
                body: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Praesentium, maxime quo ratione eos molestias totam aspernatur vitae animi repudiandae cupiditate odit nemo veniam harum. Aut vel fuga labore explicabo ducimus!',
                author: 'king_slither_220',
                subreddit: 'wallstreetbets'
            })}
            {RedditPost({
                body: 'Way to go buddy',
                author: 'a_commenter_3543',
                subreddit: 'wallstreetbets'
            })}
        </div>
        
    );
}

function RedditPost({ title, body, author, subreddit, link }) {
    const threadType = title === undefined ? 'comment' : 'post'

    return (
        <div key={body} className='thread'>
            <div className='threadTitle'>{title}</div>
            <div className='threadBody'>{body}</div>
            <div className="threadInfo">
                <span>{threadType}</span>
                <span className='threadSub'>r/{subreddit}</span>
                <span className='threadAuthor'>u/{author}</span>
            </div>
        </div>
    )
}

export default App;