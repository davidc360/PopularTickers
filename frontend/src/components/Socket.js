import './Socket.sass'
import React, { useState, useEffect, useRef } from "react"
import SanitizedHTML from 'react-sanitized-html';

import { FaCog } from 'react-icons/fa'

const badWords = new Set([
    'fuck',
    'fucking',
    'bitch',
    'shit',
    'ass',
    'cunt',
    'retard',
    'rtard',
    'jerk',
    'fuk',
    'fuckin',
    'fukin',
    'kink',
    'ass',
    'pussy',
    'cuck'
])

const badWordsRegexPattern = `(${[...badWords].join('|')})`
const badWordsRegex = new RegExp(badWordsRegexPattern, "gi")

function SocketWrapper({ threads }) {
    const [isHovering, setIsHovering] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [blockOffensive, setBlockOffensive] = useState(true)
    const [onlyShowIfTicker, setOnlyShowIfTicker] = useState(false)

    function toggleShowSettings() {
        setShowSettings(show => !show)
    }

    useEffect(() => {
        console.log(threads)
    }, [threads])

    return (
        <div className='threadsCtn'>
            <h1 className='center title threadsHeading'>
                <div className='titleWrapper'>
                    {isHovering ? '(Paused on Mouse Hover)' : 'Latest'}
                </div>
                <div className='cogWrapper'> <FaCog className="settingsToggle" onClick={toggleShowSettings} /> </div>
            </h1>
            <SettingsPane show={showSettings} setShow={setShowSettings}
                blockOffensive={blockOffensive} setBlockOffensive={setBlockOffensive}
                onlyShowIfTicker={onlyShowIfTicker} setOnlyShowIfTicker={setOnlyShowIfTicker}
            />
            <Socket threads={threads} isHovering={isHovering}
                setHover={setIsHovering} blockOffensive={blockOffensive}
                onlyShowIfTicker={onlyShowIfTicker}
            />
        </div>
    )
}

// abstract away the socket component and only update it when mouse is not hovering
const Socket = React.memo(function Socket({ threads, isHovering, setHover, blockOffensive, onlyShowIfTicker }) {
    // Turn thread informations into thread elements
    const postElements = threads?.map(thread => (
        <RedditPost {...thread}
            key={thread.body + thread.link} blockOffensive={blockOffensive}
            onlyShowIfTicker={onlyShowIfTicker}
        />
    ))

    return (
        <div className='threads' onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            {postElements}
            <RedditPost
                body='<p>Welcome to popular tickers!</p>'
                subreddit='all'
                author='david'
                type='comment'
                blockOffensive={blockOffensive}
                onlyShowIfTicker={onlyShowIfTicker}
            />
        </div>
    );
}, (prevPros, nextProps) => nextProps.isHovering)

function RedditPost({ title, body, author, subreddit, link, tickers, type, blockOffensive, onlyShowIfTicker }) {
    // if only show threads containing tickers and there aren't any tickers, return null
    if (onlyShowIfTicker && (!tickers || tickers.length == 0)) {
        return null
    }

    const threadType = title ? 'post' : 'comment'
    // convert tickers to a set
    const tickersSet = new Set(tickers)

    // bold and link to chart for tickers found in the content
    // first split the words
    // first strip word from punctuation, and transform to uppercase
    // then check if word is a bad word and if we need to filter it
    // then check if the ticker list contains the word
    function addLinkAndFilter(text) {
        // split into words by the following chars:
        // the split keeps the deliminator 
        return text.split(/([?<> .,-])/gi)
                .map(word => {
                    // remove punctuation
                    let word_transformed = word.replace(/[.,\/#!?$%\^\*;:{}=\-_`~()]/g, "")

                    // if filter bad words,turn bad words into asterisks
                    if (blockOffensive && badWords.has(word_transformed.toLowerCase())) {
                        return new Array(word.length).fill('*').join('')
                    }

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
    }

    if (type === 'linkpost') {
        // test if image link or regular link
        if (body.match(/\.(jpeg|jpg|gif|png)$/)) {
            body = <a href={"https://reddit.com" + link}> <img src={body}/> </a>
        } else {
            body = <a href={body}>{body}</a>
        }
    } else {
        body = addLinkAndFilter(body)
    }

    if (type === 'textpost') {
        body = `<p>${body}</p>`
        title = addLinkAndFilter(title)
    }


    return (
        <div className='thread'>
            {title && <div className='threadTitle'>
                <a href={'https://www.reddit.com' + link} target='_blank'>
                    <SanitizedHTML html={title} className='threadBody' />
                </a>
            </div>}
            {type === ('linkpost') ? (
                <div className='threadBody'>{body}</div>
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

function SettingsPane({ show, setShow, blockOffensive, setBlockOffensive, onlyShowIfTicker, setOnlyShowIfTicker }) {
    const hovering = useRef(false)
    const showSty = {
        maxHeight: '2.5em',
        transition: 'max-height 0.5s ease',
        overflow: 'hidden'
    }
    
    const noshowSty = {
        maxHeight: 0,
        transition: 'max-height 0.5s ease'
    }
    
    const timeouts = useRef([])
    function setTimeoutToClose() {
        timeouts.current.forEach(clearTimeout)
        timeouts.current.push(setTimeout(() => {
            if (hovering.current === false) {
                setShow(false)
            } else {
                setTimeoutToClose()
            }
        }, 2000))
    }

    useEffect(() => {
        if (show === true) {
            setTimeoutToClose()
        }
    }, [show])

    function updateBlockOffensive(e) {
        setBlockOffensive(e.target.checked)
    }

    function toggleBlockOffensive() {
        setBlockOffensive(val => !val)
    }

    function updateOnlyShowIfTicker(e) {
        setOnlyShowIfTicker(e.target.checked)
    }

    function toggleOnlyShowIfTicker(){
        setOnlyShowIfTicker(val => !val)
    }

    return (
        <div
            className={`settingsPane ${show ? '' : 'hideOverflow'}`}
            style={show ? showSty : noshowSty}
            onMouseEnter={() => { hovering.current = true }}
            onMouseLeave={() => { hovering.current = false }}
        >
            <div className='setting'>
                <input type="checkbox" checked={blockOffensive}
                    onChange={(updateBlockOffensive)} />
                <span onClick={toggleBlockOffensive}>Block offensive words</span>
            </div>
            
            <div className='setting'>
                <input type="checkbox" checked={onlyShowIfTicker}
                    onChange={(updateOnlyShowIfTicker)} />
                <span onClick={toggleOnlyShowIfTicker}>Only show threads containing tickers</span>
            </div>
        </div>
    )
}

export default SocketWrapper;