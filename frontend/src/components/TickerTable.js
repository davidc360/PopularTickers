import React, { useEffect, useState } from 'react'
import "./TickerTable.sass"

export default function() {
    return (
        <div className="stats">
            <h1>Stats</h1>
            <table className='table'>
                <thead>
                <tr>
                    <th className='left'>Ticker</th>
                    <th>Mentions</th>
                    <th>Positive</th>
                    <th>Negative</th>
                    <th>Positive %</th>
                    <th>Neutral %</th>
                    <th>Negative %</th>
                </tr>
                </thead>
                <tbody><TickerRow ticker='AAPL' /></tbody>
            </table>
        </div>
    )    
}

function TickerRow({ ticker, count, pos_sent, pos_sent_cnt=0, neg_sent, neg_sent_cnt=0, neut_sent_cnt=0}) {
    const [show, setShow] = useState(true)
    let total_sent_cnt = pos_sent_cnt + neg_sent_cnt + neut_sent_cnt
    const pos_strength = pos_sent && (pos_sent*100).toFixed(0)
    const neg_strength = neg_sent && (neg_sent*100).toFixed(0)

    const sent_percent = sent_cnt => sent_cnt > 0 ? (sent_cnt / total_sent_cnt * 100).toFixed(2) + '%' : null

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
    if(!show) return null
    return (
        <tr>
            <td className='left' onClick={googleTicker}>
                {
                    // blacklistSecret ?
                    //     // <ToolTip tooltext={'Open chart'} >
                    //     //     {ticker}
                    //     // </ToolTip>
                    //     : ticker
                    ticker
                }
            </td>
            <td>{count}</td>
            <td>{pos_strength || 0}</td>
            <td>{neg_strength || 0}</td>
            <td>{sent_percent(pos_sent_cnt) || "0%"}</td>
            <td>{sent_percent(neut_sent_cnt) || "0%"}</td>
            <td>{sent_percent(neg_sent_cnt) || "0%"}</td>
            {
                    // blacklistSecret &&
                    //     <ToolTip tooltext={'Blacklist this ticker'} className={styles.remove} onClick={blacklistTicker}>
                    //         X
                    //     </ToolTip>
            }
        </tr>
    )
}