import React, { useEffect, useState } from 'react'
import "./TickerTable.sass"

// tickers: sorted by mentions in App.js
export default function({ tickers }) {
    const tickerRows = tickers?.map(ticker => {
        // filter mentions less than 3
        // if (ticker.count <= 2) return
        return <TickerRow ticker={ticker['name']} mentions={ticker['mentions']} sentiment={ticker['sentiment']} key={ticker['name']}/>
    })
    return (
        <div className="stats">
            <h1>Stats</h1>
            <table className='table'>
                <thead>
                <tr>
                    <th className='left'>Ticker</th>
                    <th>Mentions</th>
                    <th>Sentiment</th>
                    <th>Positive %</th>
                    <th>Neutral %</th>
                    <th>Negative %</th>
                </tr>
                </thead>
                <tbody>
                    {tickerRows}
                </tbody>
            </table>
        </div>
    )    
}

function TickerRow({ ticker, mentions, sentiment}) {

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
        window.open("https://www.google.com/search?q=" + ticker,'_blank')
    }

    return (
        <tr>
            <td className='tickerName' onClick={googleTicker}>
                {
                    // blacklistSecret ?
                    //     // <ToolTip tooltext={'Open chart'} >
                    //     //     {ticker}
                    //     // </ToolTip>
                    //     : ticker
                    ticker
                }
            </td>
            <td>{mentions}</td>
            <td>{sentiment >= 0 ? '+' : ''}{Math.round(sentiment*100)}</td>
            <td>{ "0%"}</td>
            <td>{"0%"}</td>
            <td>{"0%"}</td>
            {
                    // blacklistSecret &&
                    //     <ToolTip tooltext={'Blacklist this ticker'} className={styles.remove} onClick={blacklistTicker}>
                    //         X
                    //     </ToolTip>
            }
        </tr>
    )
}