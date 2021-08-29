import React, { useEffect, useState, useRef } from 'react'
import styles from "./Tickers.module.sass"
import './icons.css'

import axios from 'axios'

// const serverURL = `https://redditstocks.herokuapp.com/`
const serverURL = 'http://127.0.0.1:5000/'

const subreddits = [
    'wallstreetbets',
    'stocks',
    'pennystocks',
    'spacs',
    'investing',
    'options',
    'robinhood',
]


export default function () {
    return (
        <div>
            {
                subreddits.map(sub => <TicksFromSub subreddit={sub}/>)
            }
        </div>
    )
}

function TicksFromSub({ subreddit }) {
    const [data, updateData] = useState()
    const alreadySynced = useRef(false)

    axios.get(serverURL + subreddit, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        }})
    .then(res => {
        if (!alreadySynced.current) {
            updateData(res.data)
            alreadySynced.current = true   
        }
    })

    let tickerRows = []
    if (data) {
        console.log(data['tickers'])
        let keys = Object.keys(data.tickers)
        // limit to 20 tickers
        keys = keys.slice(0, 20)
        // sort the tickers by mention count
        keys.sort((a, b) => data.tickers[b].count - data.tickers[a].count )
        
        for (const key of keys) {
            tickerRows.push(
                <TickerRow {...data.tickers[key]} ticker={key} key={key}/>
            )
        }
    }

    const loaded = data ? true : false
    const dataIsEmpty = !data || Object.keys(data.tickers).length == 0    

    const noTickers = (
        <div>Didn't find enough stocks being discussed.</div>
    )
    const tickerTable = (
        <table className={styles.table}>
            <thead>
            <tr>
                <th className={styles.left}>Ticker</th>
                <th>Mentions</th>
                <th>Positive Strength</th>
                <th>Negative Strength</th>
                <th>% positive</th>
                <th>% Neutral</th>
                <th>% Negative</th>
            </tr>
            </thead>
            <tbody>{tickerRows}</tbody>
        </table>
    )
    // last updated time
    let newTime
    let LUTTime
    if (data) {
        const date_from_data = data['last_updated'].slice(0, 10).split('-')
        const time_from_data = data['last_updated'].slice(-8).split(':')
        newTime = new Date(Date.UTC(...date_from_data, ...time_from_data))

        const LUTDate = `${newTime.getUTCFullYear()}-${newTime.getUTCMonth()}-${newTime.getUTCDate()}`
        const LUTHour = newTime.getHours() > 12 ? newTime.getHours()-12 : newTime.getHours()
        const LUTMinute = newTime.getMinutes() > 10 ? newTime.getMinutes() : '0' + newTime.getMinutes()
        LUTTime = LUTHour + ':' + LUTMinute
        LUTTime = newTime.getHours() > 12 ? LUTTime+'PM' : LUTTime+'AM'
        LUTTime = LUTDate+' '+LUTTime
    }
    const main_section = (
        <>
        <div className={styles.title}>
            <h1 className={styles.sub}>r/{subreddit}</h1>
            <div className={styles.lastUpdated}>
                <p>Last updated:</p>
                <p>{LUTTime}</p>
            </div>
        </div>
        { dataIsEmpty ? noTickers : tickerTable } 
        </>
    )
    const loader = (
        <>
        <div class={styles.left}>{'Scraping data from r/' + subreddit + '... estimated time is  <1 minute.'}</div>
        <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
        </>
    )

        
    return (
        <div className={styles.ctn}>
            { loaded ? main_section : loader }
        </div>
    )
}

function ToolTip({ children, tooltext, classNames, childClassNames }) {
    const [pos, setPos] = useState()
    const [showChild, setShow] = useState(false)
    function updatePos(e) {
        setShow(true)
        setPos({
            left: e.clientX + 15,
            top: e.clientY + 10,
        })    
    }
    return (
        <div
            className={`${classNames} ${styles.tooltip}`}
            onMouseMove={updatePos}
            onMouseLeave={ () => setShow(false) }
        >
            {children}
            {showChild && (
                <div
                    className={`${childClassNames} ${styles.tooltext}`}
                    style={pos ? pos : null}
                >
                    {tooltext}
                </div>
            )} 
        </div>
    )
}

function TickerRow({ ticker, count, pos_sent, pos_sent_cnt=0, neg_sent, neg_sent_cnt=0, neut_sent_cnt=0}) {
    const [show, setShow] = useState(true)
    let total_sent_cnt = pos_sent_cnt + neg_sent_cnt + neut_sent_cnt
    const pos_strength = pos_sent && (pos_sent*100).toFixed(0)
    const neg_strength = neg_sent && (neg_sent*100).toFixed(0)

    const sent_percent = sent_cnt => sent_cnt > 0 ? (sent_cnt / total_sent_cnt * 100).toFixed(2) + '%' : null

    const blacklistSecret = localStorage.getItem("blacklistSecret")
    
    function blacklistTicker() {
        axios.post(serverURL + "blacklist_ticker", {
            ticker,
            secret: blacklistSecret
        })
        setShow(false)
    }
    if(!show) return null
    return (
        <tr>
            <td className={`${styles.left}`} onClick={blacklistTicker}>
                {
                    blacklistSecret ?
                        <ToolTip tooltext={'Blacklist this ticker'} >
                            {ticker}
                        </ToolTip>
                        : ticker
                }
            </td>
            <td>{count}</td>
            <td>{pos_strength || 0}</td>
            <td>{neg_strength || 0}</td>
            <td>{sent_percent(pos_sent_cnt) || "0%"}</td>
            <td>{sent_percent(neut_sent_cnt) || "0%"}</td>
            <td>{sent_percent(neg_sent_cnt) || "0%"}</td>
        </tr>
    )
}
