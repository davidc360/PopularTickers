import React, { useEffect, useState, useRef } from 'react'

export default function () {
    function storeSecret() {
        const secret = document.querySelector('#textArea').value
        localStorage.setItem("blacklistSecret", secret)
        document.querySelector("#currentSecret").textContent = localStorage.getItem("blacklistSecret")
    }
    
    return (
        <div className='about'>            
            <div className='contact-comment'>
                <p id="currentSecret">{localStorage.getItem("blacklistSecret") || ""}</p>
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