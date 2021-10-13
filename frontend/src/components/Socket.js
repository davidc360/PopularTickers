import './Socket.sass'
import React, { useState, useEffect, useRef } from "react"

import io from "socket.io-client"
const ENDPOINT = "http://127.0.0.1:5000"

function SocketWrapper() {
    const [threads, setThreads] = useState([])
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        const socket = io(ENDPOINT);

        socket.on("new thread", data => {
            setThreads(threads => [data, ...threads])
            console.log('new thread', data)
        })

    }, []);

    return (
        <div className='threadsCtn'>
            <h1 className='center'>{isHovering ? '(Paused on Mouse Hover)' : 'Latest'}</h1>
            <Socket threads={threads} isHovering={isHovering}
                setHover={setIsHovering}
            />
        </div>
    )
}

function shouldUpdate(prevPros, nextProps) {
    return nextProps.isHovering
}

const Socket = React.memo(function Socket({ threads, isHovering, setHover }) {
    // Turn thread informations into thread elements
    const postElements = threads.map(thread => (
        RedditPost(thread)
    ))

    return (
        <div className='threads' onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
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
}, shouldUpdate)

function RedditPost({ title, body, author, subreddit, link, tickers }) {
    const threadType = title ? 'post' : 'comment'
    const bodyEl = useRef(null)

    // convert tickers to a set
    tickers = new Set(tickers)

    // bold tickers found in the content
    useEffect(() => {
        let elHTML = bodyEl.current.innerHTML
        console.log(elHTML)
    }, [body])

    return (
        <div key={body} className='thread'>
            <div className='threadTitle'><a href={'https://www.reddit.com'+link} target='_blank'> {title} </a></div>
            <div className='threadBody' ref={bodyEl}>{body}</div>
            <div className="threadInfo">
                <a href={'https://www.reddit.com'+link} target='_blank'> <span>{threadType}</span> </a>
                <a href={'https://www.reddit.com/r/'+subreddit} target='_blank'> <span className='threadSub'>r/{subreddit}</span> </a>
                <a href={'https://www.reddit.com/user/'+author} target='_blank'> <span className='threadAuthor'>u/{author}</span> </a>
            </div>
        </div>
    )
}

export default SocketWrapper;