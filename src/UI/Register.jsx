import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/register.css'
import {useState} from 'react'
import { toast } from 'react-toastify'
function Register() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate()
  const[registerUser,setRegister]=useState({
    username:'',
    email:'',
    phone:'',
    password:''
  })

  const handleInput=(e)=>{
    const{name,value}=e.target;
    setRegister({
      ...registerUser,
      [name]:value
    })
  }

  const handleSubmit=async(e)=>{
    e.preventDefault();
    // console.log(registerUser)
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`,{
        method:"POST",
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify(registerUser)
      })
      if(response.ok)
      {
        toast.success("Register successfully")
        setRegister({
          username:'',
          email:'',
          phone:'',
          password:''
          })
          navigate('/login')
      }
      else{
        toast.error("email already exist")
      }
    } catch (error) {
      console.log("error at time of registration",error)
    }
  }


  return (
    <div className="form-container">
  <div className="form-box">
    <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        name="username" 
        placeholder="name" 
        className="input" 
        required 
        value={registerUser.username}
        onChange={handleInput}/>
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        className="input" 
        required 
        value={registerUser.email}
        onChange={handleInput}/>
      <input 
        type="text" 
        name="phone" 
        placeholder="Phone" 
        className="input"
        value={registerUser.phone} 
        onChange={handleInput}/>
      <input                
        type="password" 
        name="password" 
        placeholder="Password" 
        className="input" 
        required 
        value={registerUser.password}
        onChange={handleInput}/>
      <button type="submit" className="btn">Register</button>
    </form>
    <p className="text-sm mt-4 text-center">
      Already have an account? <Link to="/login">Login</Link>
    </p>
  </div>
</div>

  )
}

export default Register