import './Contact.sass'
import React, { useEffect, useState, useRef } from 'react'
import emailjs, { init } from 'emailjs-com'
init('user_REUMllQclwmLqErmaHbkL')

export default function () {
    const [sent, setSent] = useState(false)
    const [success, setSuccess] = useState(null)

    function sendEmail() {
        setSent(true)
        emailjs.sendForm('service_3dajah7','template_nz2szng', '#contact-form')
            .then(function(response) {
                setSuccess(true)
                console.log('SUCCESS!', response.status, response.text);
            }, function(err) {
                setSuccess(false)
                console.log('FAILED...', err);
            })
    }

    const form = (
        <form id="contact-form">
            <div>
                <label>Name: </label>
                <input type="text" name="user_name" />
            </div>
            <div>
                <label>Email: </label>
                <input type="email" name="user_email" />
            </div>
            <div className='contact-comment'>
                <textarea className='contact-text-area' name="message" id="" cols="30" rows="10"></textarea>
                <br/>
                <div className='submit' onClick={sendEmail}>
                    Submit
                </div>
            </div>
        </form>
    )
    
    return (
        <div className='contact'>            
            <h1>
                Contact
            </h1>
            <div>
                    Suggestions? Comments? Leave a message below!
            </div>
            <br/>
            {sent ? 
                success === true ? (
                    <div className="responseMsg"><br/><br/>Message sent, thank you! 😊</div>
                ) : (
                        success === false ? (
                            <div className="responseMsg"><br/><br/>Message failed to send, please try again!</div>
                        ) : (
                            <div className="responseMsg"><br/><br/>Sending message...</div>
                        )
                )
            : form}
            <br/>
            <br />
            <a href="/" target="_self">👈 Back to home</a>
        </div>
    )
}