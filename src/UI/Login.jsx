import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/register.css'
import { toast } from 'react-toastify'
import { useAuth } from '../store/auth'

function Login() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate()
  const{storeToken}=useAuth()
    const[loginData, setLogin]=useState({
      email:"",
      password:""
    })

  const handleInput=(e)=>{
    const{name,value}= e.target;
    setLogin({
      ...loginData,
      [name]:value
    })
  }
    const handleSubmit=async(e)=>{
      e.preventDefault();
      try {
          const response = await fetch(`${API_BASE}/api/auth/login`,{
          method:"POST",
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify(loginData)
        })
        if(response.ok){
          const data = await response.json()
          storeToken(data.token)
          // console.log(data.token)
          toast.success("Login successfully")
          setLogin({
            email:"",
            password:""
          })
          navigate('/chatds')
        }
        else{
          toast.error("invalid email or password")
        }
      } catch (error) {
        console.log("error at the time of login",error)
      }
    }
  return (
    <div className="form-container">
  <div className="form-box">
    <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        name="email"
        placeholder="Email" 
        className="input" 
        required 
        value={loginData.email}
        onChange={handleInput}/>
      <input 
        type="password"
        name='password' 
        placeholder="Password" 
        className="input" 
        required 
        value={loginData.password}
        onChange={handleInput}/>
      <button type="submit" className="btn">Login</button>
    </form>
    <p className="text-sm mt-4 text-center">
      Don't have an account? <Link to="/register">Register</Link>
    </p>
  </div>
</div>

)
}

export default Login