import './Socket.sass'
import React, { useState, useEffect, useRef } from "react"
import SanitizedHTML from 'react-sanitized-html';

function SocketWrapper({ threads }) {
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        console.log(threads)
    }, [threads])

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
    const postElements = threads?.map(thread => (
        <RedditPost {...thread} key={thread.body + thread.link}/>
    ))

    return (
        <div className='threads' onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            {postElements}
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
    // console.log(tickerList.has("->".replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/<.+?>/g, "").toUpperCase()))
    if (type === 'linkpost') {
        // test if image link or regular link
        if (body.match(/\.(jpeg|jpg|gif|png)$/)) {
            body = <a href={"https://reddit.com" + link}> <img src={body}/> </a>
        } else {
            body = <a href={body}>{body}</a>
        }
    } else {
        body = body
                    // spit words by non alphabetic chars and ' (apostrophe)
                    // the split keeps the deliminator
                    .split(/([<> .,-?])/gi)
                    .map(word => {
                        // remove punctuation
                        let word_transformed = word.replace(/[.,\/#!?$%\^\*;:{}=\-_`~()]/g, "")
                        // if letter is over 2 letters long, uppercase it
                        if (word_transformed.length > 2)
                            word_transformed = word_transformed.toUpperCase()
                        if (tickersSet.has(word_transformed)) {
                            return `<a href="https://www.google.com/search?q=${word}+stock"><strong>${word}</strong></a>`
                        } else {
                            return word
                        }
                    })
                    .join('')
        // body = body.replaceAll(new RegExp(`("|>|^|\\s|\\b)(${[...tickerList, "'"].join('|')})("|<|\\s|$|\\b)`, 'gi'), '$1<b>$2</b>$3')
        // body = body.replaceAll(new RegExp(`([^a-zA-Z0-9_'&;]|^)(${[...tickerList].join('|')})([^a-zA-Z0-9_'&;]|$)`, 'ig'), '$1<b>$2</b>$3')
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
                <a href={'https://www.reddit.com'+link+(threadType === 'comment' ? '?context=8&depth=9' : '')} target='_blank'> <span>{threadType}</span> </a>
                <a href={'https://www.reddit.com/r/'+subreddit} target='_blank'> <span className='threadSub'>r/{subreddit}</span> </a>
                <a href={'https://www.reddit.com/u/'+author} target='_blank'> <span className='threadAuthor'>u/{author}</span> </a>
            </div>
        </div>
    )
}

export default SocketWrapper;