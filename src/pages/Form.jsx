import React, {useState} from 'react'
import { useAuth, supabase } from "../../auth/Auth";
import axios from "axios";
import './Form.css'

// StarRating component (same as provided earlier)
const StarRating = ({ totalStars, onStarClick }) => {
    const [rating, setRating] = useState(0)
  
    const handleStarClick = (selectedRating) => {
      setRating(selectedRating)
      onStarClick(selectedRating)
    };
  
    return (
        <div>
        {[...Array(totalStars)].map((_, index) => (
          <span
            key={index}
            onClick={() => handleStarClick(index + 1)}
            style={{
                cursor: 'pointer',
                fontSize: '35px',
                color: index < rating ? 'gold': 'gray',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };


const Form = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
  
    const handleStarClick = (selectedRating) => {
      console.log(`Selected rating: ${selectedRating}`);
      setRating(selectedRating);
    };
  
    //function sendMail(){
    const sendMail = async () => {

      if(name && email && subject && rating && message){
        try{
        await axios.post('http://localhost:3000/send_email', {
          name,
          email,
          subject,
          rating,
          message,
        });

         //Reset the form after sucessful submission

         setName('');
         setEmail('');
         setSubject('');
         setRating(0);
         setMessage(''); 

      alert("Feedback sent successfully!");
        
      } catch (error) {
        console.error('Error sending feedback:', error); 
        alert("Error");

      }
     } else {
      alert("Fill in all the required fields");

     }
    };
  
    return(
        <main className="ml-0 md:ml-64">
        <section>
            <div className="conatiner">
                <h2 className = "text-center">Contact Form</h2>
                <form className="form-control card" onSubmit={(e) => {e.preventDefault(); setName(''); setEmail(''); setSubject(''); setRating(0); setMessage('');}} >
                    <input type="text" placeholder='Name' name='name' value = {name} onChange={(e) => setName(e.target.value)} required />
                    <input type="text" placeholder='Email' name='email' value = {email} onChange={(e) => setEmail(e.target.value)} required />
                    <div className="subject-options">
                        <h2>Subject</h2>
                        <label>
                        <input type="radio" name="subject" value="General feedback" checked={subject === "General feedback"} onChange={ () => setSubject("General feedback")} /> General feedback
                        </label>
                        <label>
                        <input type="radio" name="subject" value="Report an issue" checked={subject === "Report an issue"} onChange={() => setSubject("Report an issue")} /> Report an issue
                        </label>
                        <label>
                        <input type="radio" name="subject" value="Other" checked={subject === "Other"} onChange={() => setSubject("Other")} /> Other
                        </label>
                    </div>

                    <div className="star-rating">
                        <h3>How would you rate this app?</h3>
                        <StarRating totalStars={5} value={rating} onStarClick={handleStarClick} onChange={(e) => setRating(e.target.value)}/>
                    </div>

                    <textarea placeholder="  Message" name="message" cols="40" rows="4" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                    <button type="submit" onClick = {() => sendMail()} className="btn btn-primary bg-gray">Submit</button>

                </form>
            </div>
        </section>
        </main>
    );    
};

export default Form