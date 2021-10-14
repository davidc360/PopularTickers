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

const ENDPOINT = "http://127.0.0.1:5000"
axios.defaults.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
}

function Home() {
    const [threads, setThreads] = useState([])
    const [currentTickers, setCurrentTickers] = useState({})

    useEffect(() => {
        // set up websockets
        const socket = io(ENDPOINT);
        socket.on("new thread", data => {
            setThreads(threads => [data, ...threads])
        })

        // get current tickers and their stats
        axios.get(ENDPOINT + '/stats').then(res => setCurrentTickers(res.data))

    }, []);

    const sortedTickers = Object.keys(currentTickers).map(ticker => {
        return {
            name: ticker,
            count: currentTickers[ticker]
        }
    }).sort((a, b) => (b.count - a.count))

    return (
        <div className='main'>
            <TickerTable tickers={ sortedTickers }/>
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
