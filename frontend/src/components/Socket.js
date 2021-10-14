import './Socket.sass'
import React, { useState, useEffect, useRef } from "react"
import SanitizedHTML from 'react-sanitized-html';

import io from "socket.io-client"
import axios from 'axios'

const ENDPOINT = "http://127.0.0.1:5000"
axios.defaults.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
}

let tickerList = new Set()

axios.get(ENDPOINT + '/tickerlist').then(res => tickerList = new Set(res.data))

function SocketWrapper() {
    const [threads, setThreads] = useState([])
    const [isHovering, setIsHovering] = useState(false)

    useEffect(async () => {
        const socket = io(ENDPOINT);

        socket.on("new thread", data => {
            setThreads(threads => [data, ...threads])
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

// abstract away the socket component and only update it when mouse is not hovering
const Socket = React.memo(function Socket({ threads, isHovering, setHover }) {
    // Turn thread informations into thread elements
    const postElements = threads.map(thread => (
        <RedditPost {...thread} key={thread.body + thread.link}/>
    ))

    return (
        <div className='threads' onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            {postElements}
            {RedditPost({
                title: 'Post Title',
                body: 'AAPL, Lorem ipsum dolor, sit amet consectetur adipisicing elit. Praesentium, maxime quo ratione eos molestias MSFT totam aspernatur vitae animi repudiandae cupiditate odit nemo veniam harum. Aut vel fuga labore explicabo ducimus!',
                author: 'king_slither_220',
                subreddit: 'wallstreetbets',
                type: 'textpost'
            })}
            {RedditPost({
                body: 'Way to go buddy love TGT',
                author: 'a_commenter_3543',
                subreddit: 'wallstreetbets'
            })}
        </div>
    );
}, (prevPros, nextProps) => nextProps.isHovering)

function RedditPost({ title, body, author, subreddit, link, tickers, type }) {
    const threadType = title ? 'post' : 'comment'
    // convert tickers to a set
    const tickersSet = new Set(tickers)

    // bold tickers found in the content
    // first strip word from punctuation, and transform to uppercase
    // then check if the ticker list
    // console.log(type, body, link)
    if (type === 'linkpost') {
        // test if image link or regular link
        if (body.match(/\.(jpeg|jpg|gif|png)$/)) {
            body = <a href={"https://reddit.com" + link}> <img src={body}/> </a>
            console.log('got an image link', body)
        } else {
            body = <a href={body}>{body}</a>
        }
    } else {
        body = body.split(' ')
                    .map(word => (
                        tickerList.has(word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toUpperCase()) ?
                        `<strong>${word}</strong>`
                        : word
                    ))
                    .join(' ')
    }

    if (type === 'textpost') {
        body = `<p>${body}</p>`
    }


    return (
        <div className='thread'>
            <div className='threadTitle'><a href={'https://www.reddit.com'+link} target='_blank'> {title} </a></div>
            {type === ('linkpost') ? (
                <div className='threadBody'>{body}</div>
                // <SanitizedHTML html={`<p>${body}</p>`} className='threadBody'/>      
            ) : (
                <SanitizedHTML html={body} className='threadBody'/>      
            )}
            <div className="threadInfo">
                <a href={'https://www.reddit.com'+link} target='_blank'> <span>{threadType}</span> </a>
                <a href={'https://www.reddit.com/r/'+subreddit} target='_blank'> <span className='threadSub'>r/{subreddit}</span> </a>
                <a href={'https://www.reddit.com/u/'+author} target='_blank'> <span className='threadAuthor'>u/{author}</span> </a>
            </div>
        </div>
    )
}

export default SocketWrapper;