import React, { useEffect } from 'react'

import { Link } from 'react-router-dom'

export default function () {
   
    return (
        <nav>
            <h1 className='logo'> Popular Tickers! </h1>
            <ul className='nav-links'>
                <Link to={'/'}>
                    <li className='nav-link'>Home</li>
                </Link>
                <Link to={'/about'}>
                    <li className='nav-link'>About</li>
                </Link>
                <Link to={'/contact'}>
                    <li className='nav-link'>Contact</li>
                </Link>
            </ul>
        </nav>
    )
}