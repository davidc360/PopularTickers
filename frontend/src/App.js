import './App.sass';
import React, { useState, useEffect, useRef } from "react"

import { BrowserRouter, Route, Switch  } from 'react-router-dom'
import Nav from './components/Nav'
import About from './components/About'
import Socket from './components/Socket'
import TickerTable from './components/TickerTable'
import Contact from './components/Contact'
import EnterSecret from './components/EnterSecret'

import io from "socket.io-client"
import axios from 'axios'

const ENDPOINT = process.env.REACT_APP_ENDPOINT
axios.defaults.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
}
console.log('env endpoint: ' + process.env.REACT_APP_ENDPOINT)

function Home() {
    const [threads, setThreads] = useState([])
    const [currentTickers, _setCurrentTickers] = useState({})
    const currentTickersRef = useRef(currentTickers)
    const setCurrentTickers = tickers => { currentTickersRef.current = tickers; _setCurrentTickers(tickers)}
    // using ref to work around access the state in socket handler
    // see https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559

    const [queryHour, setQueryHour] = useState(1)
    function updateTickerList(hour) {
        console.log(hour)
        axios.get(ENDPOINT + 'stats?hours=' + hour).then(res => {
            const ticker_obj = {}
            res.data.forEach(ticker => {
                ticker_obj[ticker['name']] = ticker 
            })
            setCurrentTickers(ticker_obj)
        })
    }

    // update ticker list every time the query hour changes
    useEffect(() => {
        updateTickerList(queryHour)
    }, [queryHour])

    useEffect(() => {
        // set up websockets
        const socket = io(ENDPOINT);
        const handleNewThread = data => {
            setThreads(threads => [data, ...threads])

            // console.log('current tickers', currentTickersRef.current)

            // update ticker mention count
            // add 1 to the mention if ticker already in list
            // if not, initiate it
            if (data.tickers.length > 0) {
                const updatedTickerList = { ...currentTickersRef.current }

                data.tickers.forEach(ticker => {
                    let currentInfo
                    if (ticker in updatedTickerList) {
                        currentInfo = updatedTickerList[ticker]
                    } else {
                        currentInfo = {
                            'name': ticker,
                            'mentions': 0,
                            'sentiment': 0,
                            'positive_count': 0,
                            'negative_count': 0,
                            'neutral_count': 0,
                        }
                    }

                    
                    // update ticker's mention count
                    currentInfo['mentions'] += 1
                    
                    // update sentiment
                    currentInfo['sentiment'] = (currentInfo['sentiment'] * (currentInfo['mentions'] - 1) + data.sentiment) / currentInfo['mentions'] 

                    // update sentiment %
                    if (data.sentiment > 1) {
                        currentInfo['positive_count'] += 1    
                    } else if (data.sentiment < 1) {
                        currentInfo['negative_count'] += 1    
                    } else if (data.sentiment === 0) {
                        currentInfo['neutral_count'] += 1    
                    }
                })
                setCurrentTickers(updatedTickerList)
            }
        }
        socket.on("new thread", handleNewThread)

        // get last thread on first render
        axios.get(ENDPOINT + 'last_thread').then(res => setThreads([res.data]))

        return () => {
            // turning of socket listner on unmount
            socket.off('new thread', handleNewThread);
        }
    }, []);

    // map the object that contains all tickers to add the 'name' field
    // then sort it based on count
    // console.log(currentTickers)
    const sortedTickers = currentTickers ?
        Object.values(currentTickers).sort((a, b) => (b.mentions - a.mentions)) 
        : []

    // limit tickers to 1000
    // allow users to set this in the futures
    if(sortedTickers.length > 500) sortedTickers.length = 500
    if(threads.length > 500) setThreads(threads.slice(0, 500))
    console.log(sortedTickers)

    return (
        <div className='main'>
            <TickerTable tickers={sortedTickers} setQueryHour={setQueryHour} queryHour={queryHour}/>
            <Socket threads={ threads }/>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
                <div className="App">
                <Nav />
                <Switch>    
                    <Route exact path='/' component={Home} />
                    <Route path='/about' component={About} />
                    <Route path='/contact' component={Contact} />
                    <Route path='/code' component={EnterSecret} />
                    {/* route reddit links to reddit */}
                    <Route path='/r/:subreddit' component={() => { window.location.replace('https://reddit.com/' + window.location.pathname) }} />
                    <Route path='/u/:user' component={() => { window.location.replace('https://reddit.com/' + window.location.pathname) }} />
                   
                    <Route path='*' component={()=>(<div>Oh no!!!! Page not found.</div>)} />
                </Switch>
                </div>
        </BrowserRouter>
    );
}

export default App;
