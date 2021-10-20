import './Nav.sass'
import React, { useEffect } from 'react'

import { Link } from 'react-router-dom'

export default function () {
   
    return (
        <nav className='nav'>
            <h1 className='logo'>Popular Tickers</h1>
            <ul className='nav-links'>
                <Link to={'/'} target="_self">
                    <li className='nav-link'>Home</li>
                </Link>
                <Link to={'/about'} target="_self">
                    <li className='nav-link'>About</li>
                </Link>
                <Link to={'/contact'} target="_self">
                    <li className='nav-link'>Contact</li>
                </Link>
            </ul>
        </nav>
    )
}