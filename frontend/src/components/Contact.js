import React, { useEffect, useState, useRef } from 'react'

export default function () {
    
    return (
        <div className='about'>            
            <h1>
                Contact
            </h1>
            <div>
                    Suggestions? Comments?
            </div>
            <br/>
            <div className='contact-comment'>
                <textarea className='contact-text-area' name="" id="" cols="30" rows="10" value="Not yet implemented." readOnly></textarea>
                <br/>
                <div className='submit'>
                    Submit
                </div>
            </div>
            <br/>
            <br />
            <a href="/">👈 Back to home</a>
        </div>
    )
}