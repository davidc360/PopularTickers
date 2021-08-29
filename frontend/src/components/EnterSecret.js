import React, { useEffect, useState, useRef } from 'react'

export default function () {
    function storeSecret() {
        const secret = document.querySelector('#textArea').value
        console.log(secret)
        localStorage.setItem("blacklistSecret", secret)
    }
    
    return (
        <div className='about'>            
            <div className='contact-comment'>
                <textarea className='contact-text-area' name="" id="textArea" cols="30" rows="10"></textarea>
                <br/>
                <div className='submit' onClick={storeSecret}>
                    Submit
                </div>
            </div>
            <br/>
            <br />
            <a href="/">👈 Back to home</a>
        </div>
    )
}