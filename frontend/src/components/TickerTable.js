import React, { useEffect, useState } from 'react'
import "./TickerTable.sass"

// tickers: sorted by mentions in App.js
export default function ({ tickers }) {
    const tickerRows = tickers?.map(ticker => (
        <TickerRow key={ticker['name']} { ...ticker } />
    ))

    return (
        <div className="stats">
            <h1>Stats</h1>
            {tickers.length === 0 ? (
                <div>Not data in this time frame yet.</div>
            ) : (
                <table className='table'>
                    <thead>
                    <tr>
                        <th className='left'>Ticker</th>
                        <th>Mentions</th>
                        <th>Sentiment</th>
                        <th>Positive</th>
                        <th>Neutral</th>
                        <th>Negative</th>
                    </tr>
                    </thead>
                    <tbody>
                        {tickerRows}
                    </tbody>
                </table>
            )}
            
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
        window.open("https://www.google.com/search?q=" + name,'_blank')
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
                    name
                }
            </td>
            <td>{mentions}</td>
            <td>{sentiment >= 0 ? '+' : ''}{(sentiment*100).toFixed(2)}</td>
            <td>{Math.round((positive_count / mentions)*100)}%</td>
            <td>{Math.round((neutral_count / mentions)*100)}%</td>
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