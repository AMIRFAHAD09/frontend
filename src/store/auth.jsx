import { createContext, useContext, useEffect, useState } from "react";
// import { getAllusers } from "../../../Backend/Controller/auth-controller";

export const UserContext = createContext();

export const AuthProvider =({children})=>{
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const[token,setToken]=useState(() => localStorage.getItem("token") || "");
    const[allUser,setAllUser]=useState([])
    const[getUser,setUser]=useState();
    const[loading,setLoading]=useState(true);

    
    const storeToken = (serverToken)=>{
        localStorage.setItem("token",serverToken)
        setToken(serverToken)
    }
    const getToken = () => {
      return localStorage.getItem('token')
    }
  
    const isLoggedIn = () => {
      return !!getToken()
    }
    const logout = () => {
      localStorage.removeItem('token')
    }
    //get all user 
    const allUsers= async()=>{
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE}/api/auth/all`,{
                method:"GET"
            })
           if(res.ok){
            const all_data = await res.json();
            setAllUser(all_data)
           }
           setLoading(false)
        } catch (error) {
            console.log("error when fetching all users",error)
        }
    }
    //get single user data
    const userAuthentication= async()=>{
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE}/api/auth/users`,{
                method:'GET',
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            if(res.ok){
                const data = await res.json();
                // console.log(data.data)
                setUser(data.data)
            }
            setLoading(false)
        } catch (error) {
            console.log("error for fetching user data")
        }
    }

     useEffect(()=>{
        if (token) {
            userAuthentication();
          }
          allUsers();
     },[token])

     //add contact
     const addContactToBackend = async (contact, token) => {
        const res = await fetch(`${API_BASE}/api/chat/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contact),
        });
      
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to add contact");
      
        return data.chatContacts;
      };

      //update contact
      const updateContactBackend = async (contact, token) => {
        const res = await fetch(`${API_BASE}/api/chat/contact/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contact),
        });
      
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to add contact");
      
        return data.chatContacts;
      };
      //fetch contact
      const fetch_contact = async(token)=>{
        const res = await fetch(`${API_BASE}/api/chat/get/contact`,{
            method:"GET",
            headers: {
                Authorization: `Bearer ${token}`,
              },
        })
        if (!res.ok) throw new Error("Failed to fetch contacts");

            const data = await res.json();
            return data.chatContacts;
      }
      // deleteContacat
      const deleteContactFromBackend=async(token,userId,usertoDelete)=>{
        const res = await fetch(`${API_BASE}/api/chat/delete/contact/${userId}`,{
          method:"DELETE",
          headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: usertoDelete.phone }),
        })
        if (!res.ok) throw new Error("Failed to delete contact");
        return await res.json();
      }
///store message
      const saveMessageToBackend = async (token, messageData) => {
        const res = await fetch(`${API_BASE}/api/message/store`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        });
      
        if (!res.ok) throw new Error("Failed to save message");
        return await res.json();
      };
      //fetch chatting
      const fetchChatHistory = async (token, userId, contactId) => {
        const res = await fetch(`${API_BASE}/api/message/history/${userId}/${contactId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
        if (!res.ok) throw new Error("Failed to fetch chat history");
        return await res.json();
      };

      //delet all message between two users
      const clearChat = async(token,userId,contactId)=>{
        const res = await fetch(`${API_BASE}/api/message/delete/${userId}/${contactId}`,{
          method:"DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to delete chat history");
        return await res.json()
      }
    return <UserContext.Provider value={{storeToken,isLoggedIn,logout,getUser,allUser,addContactToBackend,fetch_contact,token,saveMessageToBackend,fetchChatHistory,updateContactBackend,deleteContactFromBackend,clearChat}}>
        {children}
    </UserContext.Provider>
}

export const useAuth=()=>{
    return useContext(UserContext)
}