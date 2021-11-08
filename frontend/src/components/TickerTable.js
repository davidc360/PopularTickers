import React, { useEffect, useState, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'

import "./TickerTable.sass"

// tickers: sorted by mentions in App.js
export default function ({ tickers, queryHour, setQueryHour, isLoadingData }) {
    const isWide = useMediaQuery({
        query: '(min-width: 1025px)'
    })
    
    // console.log('ticker table: ', tickers)
    const tickerRows = []
    tickers?.forEach(ticker => {
        // if (ticker.mentions > 2) {
            tickerRows.push(<TickerRow key={ticker['name']} {...ticker} />)
        // }
    })
    if(tickerRows.length > 300) tickerRows.length = 300

    if(!isWide && tickerRows.length > 20) tickerRows.length = 20
    // console.log('ticker rows: ', tickerRows)

    // if there are ticker rows, display a message
    if (tickerRows.length === 0) tickerRows.push(
        <tr>
            <td colSpan="6">
                <br />
                Not data in this time frame yet.
            </td>
        </tr>
    )

    const [loadingText, setLoadingText] = useState("")
    const loadingDotsInterval = useRef()
    useEffect(() => {
        if(isLoadingData) {
            let length = 0
            function incrementDot() {
                length = (length + 1) % 4
                setLoadingText('Loading data' + '.'.repeat(length+1))
            }
            incrementDot()
            loadingDotsInterval.current = setInterval(() => {
               incrementDot()
            }, 400)
        } else {
            clearInterval(loadingDotsInterval.current)
        }
    }, [isLoadingData])

    return (
        <div className="stats">
            <h1>Stats</h1>
            <ul className='hour-selectors'>
                <li className={`hour-selector nav-link ${queryHour === 1 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(1)}>1H</li>
                <li className={`hour-selector nav-link ${queryHour === 4 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(4)}>4H</li>
                <li className={`hour-selector nav-link ${queryHour === 12 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(12)}>12H</li>
                <li className={`hour-selector nav-link ${queryHour === 24 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(24)}>1D</li>
                <li className={`hour-selector nav-link ${queryHour === 72 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(72)}>3D</li>
                <li className={`hour-selector nav-link ${queryHour === 168 ? 'hour-selected' : ''}`} onClick={()=>setQueryHour(168)}>1W</li>
            </ul>
            <table className='table'>
                <thead>
                    <tr>
                        <th className='tickerName'>Ticker</th>
                        <th>Mentions</th>
                        <th>Strength</th>
                        <th>Positive</th>
                        {/* <th>Neutral</th> */}
                        <th>Negative</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoadingData ? (
                        <tr>
                            <td colSpan="6">
                                <br />
                                {loadingText}
                            </td>
                        </tr>
                    ) : (tickerRows)}
                </tbody>
                      
            </table>
        </div>
    )    
}

function TickerRow({ name, mentions, sentiment, positive_count, neutral_count, negative_count }) {

    // const sent_percent = sent_cnt => sent_cnt > 0 ? (sent_cnt / total_sent_cnt * 100).toFixed(2) + '%' : null

    // const blacklistSecret = localStorage.getItem("blacklistSecret")
    
    // function blacklistTicker() {
    //     axios.post(serverURL + "blacklist_ticker", {
    //         ticker,
    //         secret: blacklistSecret
    //     })
    //     setShow(false)
    // }

    function googleTicker() {
        window.open("https://www.google.com/search?q=" + name + "+stock",'_blank')
    }

    return (
        <tr>
            <td className='tickerName' onClick={googleTicker}>
                { name }
            </td>
            <td>{mentions}</td>
            <td>{(sentiment*100).toFixed(2)}</td>
            <td>{Math.round((positive_count / mentions)*100)}%</td>
            {/* <td>{Math.round((neutral_count / mentions)*100)}%</td> */}
            <td>{Math.round((negative_count / mentions)*100)}%</td>
            {
                    // blacklistSecret &&
                    //     <ToolTip tooltext={'Blacklist this ticker'} className={styles.remove} onClick={blacklistTicker}>
                    //         X
                    //     </ToolTip>
            }
        </tr>
    )
}