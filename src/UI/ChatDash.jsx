import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import { toast } from 'react-toastify'
import { io } from "socket.io-client";
import { IoMdAdd } from "react-icons/io";
import { IoEllipsisVerticalOutline } from "react-icons/io5";
import { IoCloseSharp } from "react-icons/io5";
import Lottie from 'react-lottie'
import animationData from '../animation/typing.json'
import { useNavigate } from "react-router-dom";
import { IoSendOutline } from "react-icons/io5";
import { TiArrowBack } from "react-icons/ti";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE, {
  auth: {
    token: localStorage.getItem("token"),
  },
});


function ChatDashboard() {
  // These function import from context APi auth.jsx...
  const { token,logout, getUser, allUser, addContactToBackend, fetch_contact, saveMessageToBackend, fetchChatHistory, updateContactBackend, deleteContactFromBackend, clearChat } = useAuth();

  const Navigate = useNavigate();

  const [userLists, setUserLists] = useState([])
  const [newUser, setNewUser] = useState({ username: "", number: "" });
  const [showForm, setForm] = useState(false)
  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null); // Receiver ID
  const [chat, setChat] = useState([]);
  const [selectedCustomName, setSelectedCustomName] = useState("");

  
  //menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);

//typing
const [isTyping, setIsTyping] = useState(false);
const [typingUser, setTypingUser] = useState(false);

//notification
const [unreadCounts, setUnreadCounts] = useState({});

// online and off line
const[onlineUsers,setOnlineUsers]=useState(new Set());

// online and offline function

useEffect(() => {
  socket.on("user_online", ({ userId }) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
  });

  socket.on("user_offline", ({ userId }) => {
    setOnlineUsers(prev => {
      const updated = new Set(prev);
      updated.delete(userId);
      return updated;
    });
  });


  socket.emit("get_online_users");

  socket.on("online_users", (userIds) => {
    setOnlineUsers(new Set(userIds));
  });
  return () => {
    socket.off("user_online");
    socket.off("user_offline");
    socket.off("online_users");
  };
}, []);

const isOnline = onlineUsers.has(selectedChat?._id)

let typingTimeout
const defaultOptions={
  loop:true,
  autoplay:true,
  animationData:animationData,
  renderSetting:{
    preserveAspectRatio:"xMidYMid slice",
  }
}


//Notification 
useEffect(() => {
  const handleMessage = (data) => {
    console.log("Incoming message:", data);

    if (selectedChat?._id === data.from  || selectedChat?._id === data.to) {
      setChat((prev) => [...prev, data]);
    } else {
      setUnreadCounts((prev) => {
        const updated = {
          ...prev,
          [data.from]: (prev[data.from] || 0) + 1,
        };
        console.log("Updated unreadCounts:", updated);
        return updated;
      });
    }
  };

  socket.on("receive_message", handleMessage);
  return () => socket.off("receive_message", handleMessage);
}, [getUser, selectedChat]);


//typing function
// const typingTimeoutRef = useRef(null);
  const handleTyping = (e) => {
    setMessage(e.target.value);
  
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { from: getUser._id, to: currentUserId });
    }
  
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop Typing", { from: getUser._id, to: currentUserId });
    }, 1000); // stop typing after 1s of inactivity
}



  useEffect(() => {
    socket.on("typing", ({ from }) => {
      if (from === currentUserId) {
        setTypingUser(true);
      }
    });
  
    socket.on("stop Typing", ({ from }) => {
      if (from === currentUserId) {
        setTypingUser(false);
      }
    });
  
    return () => {
      socket.off("typing");
      socket.off("stop Typing");
    };
  }, [currentUserId]);
  
  //mobile view resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true); // Always show both on desktop
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear chat 
  const handleClearChat = () => {
    // console.log(selectedChat)
    deleteChat(selectedChat._id)
  }
  const deleteChat = async (contactId) => {
    if (!contactId) return;
    try {
      await clearChat(token, getUser._id, contactId)
      console.log("here after clear")
      setChat([]);
      setMenuOpen(false)
      //  setSelectedChat(null);
    } catch (error) {
      toast.error("Failed to clear chat");
    }

  }

// Rename the added contact.....
  const handleRename = (e) => {
    setForm(!showForm)
    setMenuOpen(!menuOpen)
    //select name that i want rename
    const data = getUser.chatContacts.find(
      (curData) => curData.number === selectedChat.phone
    );
    // console.log(data)
    // data show in form box
    if (data) {
      setNewUser({
        username: data.username,
        number: data.number,
      });
    }
  }

  // Profile picture chage......
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pic", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload/profile/${getUser._id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile picture updated!");
        // Update local user data
        getUser.pic = data.user.pic;
      } else {
        toast.error("Failed to upload profile picture");
      }
    } catch (err) {
      toast.error("Upload error");
      console.error(err);
    }
  };

  // show contact form for add user for chat....
  const addUsers = () => {
    setForm(!showForm)
  }

  // Add contact ........
  const addContact = async (e) => {
    e.preventDefault();
    const entered_number = newUser.number.toString().trim();
    const exists = allUser.some(user => user.phone === entered_number);

    if (!exists) {
      toast.error("user not register in this app");
      return;
    }
    try {
      let updatedContacts;
      const alreadyAdded = userLists.some(user => user.number === entered_number);
      if (alreadyAdded) {
        updatedContacts = await updateContactBackend(newUser, token)
        setForm(false);
        setMenuOpen(false)
        setNewUser({ username: "", number: "" });
        const contacts = await fetch_contact(token);
        setUserLists(contacts);
        toast.success("rename name");
        return;
      }
      else {
        // const token = localStorage.getItem("token");
        updatedContacts = await addContactToBackend(newUser, token);
        setUserLists(updatedContacts); // Update UI
        setForm(false);
        setMenuOpen(false)
        setNewUser({ username: "", number: "" });
        toast.success("Contact added");
      }
    } catch (err) {
      toast.error(err.message);
    }

  }

  //delete contact 
  const handleDelete = async (usertoDelete) => {
    if (!usertoDelete) return;
    // console.log(selectedChat)
    try {
      const updatedContacts = await deleteContactFromBackend(token, getUser._id, usertoDelete);
      // setUserLists(updatedContacts);
      const contacts = await fetch_contact(token);
      setUserLists(contacts); // update the contact list
      setDeleteMenu(null)
    } catch (error) {
      console.log("error when click on delete", error)
    }

  }
  //search the user for chat......
  const handleSearch = (e) => {
    setSearch(e.target.value);
  }
  const searchData = userLists.filter((curData) =>
    curData.username.toLowerCase().includes(search.toLowerCase()));
  //fetch contact
  useEffect(() => {
    const loadContacts = async () => {
      // const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const contacts = await fetch_contact(token);
        setUserLists(contacts); // update the contact list
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Could not load contacts");
      }
    };

    loadContacts(); // Call the async function
  }, []);

  // fetch chat history 
  const loadChatHistory = async (contactId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const history = await fetchChatHistory(token, getUser._id, contactId);
      setChat(history);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast.error("Could not load chat history");
    }
  };

// Select user for chat start........
  const handleSelectUser = (user) => {
    setSelectedChat(user)
    const otherUserId = user._id
    setCurrentUserId(otherUserId);
    //function
    loadChatHistory(user._id);
    socket.emit("join_room", { otherUserId });
    // setChat([]); // optional: reset messages when switching user
    socket.emit("get_chat_history", {
      from: getUser._id,
      to: otherUserId,
    });

    //notification clear
    setUnreadCounts((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
    // Find the name you saved when adding user
    const custom = userLists.find(u => u.number === user.phone);
    setSelectedCustomName(custom?.username || user.username);
     // 👉 Hide sidebar on mobile
  if (isMobile) setShowSidebar(false);
  };

  // useEffect(() => {
  //   const handleMessage = (data) => {
  //     // Prevent echo: skip if senderId is current user
  //     if (data.senderId === getUser._id) return;
  //     setChat((prev) => [...prev, data]);
  //   };

  //   socket.on("receive_message", handleMessage);

  //   return () => {
  //     socket.off("receive_message", handleMessage);
  //   };
  // }, [getUser]);

// Send message............
  const sendMessage = async () => {
    if (message.trim()) {
      const msgData = {
        from: getUser._id,
        to: currentUserId,
        content: message,
        // deletFor:getUser._id
        //sender: getUser.username, // replace with user context
      };
      socket.emit("send_message", msgData);
      // setChat((prev) => [...prev, msgData]);
      try {
        await saveMessageToBackend(token, msgData);
        setMessage("");
      } catch (err) {
        console.error("Error saving message:", err);
        toast.error("Failed to save message");
      }

    }
  };
  
  //Show your profile 
  const handleProfile = () => {
    setShowProfile(true);
  };
  
  return (
  <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {(!isMobile || (isMobile && showSidebar)) && (
    <div className={`w-full md:w-1/4 bg-gray-900 p-4 overflow-y-auto ${isMobile ? 'absolute z-20 h-full w-full' : ''}`}>
       <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12  relative">
            <img
              src={getUser ? getUser.pic : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* user profile */}
          <div onClick={handleProfile}>
            <p className="font-semibold text-white">{getUser ? getUser.username : "You"}</p>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
          {showProfile &&
          <div className="bg-white p-2 rounded-2xl mt-3 shadow-lg w-52 sm:w-50 text-center relative">
            <button 
              onClick={()=>setShowProfile(false)}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-500"><IoCloseSharp/>
            </button> 
             {/* Profile picture upload section */}
             <div className="relative w-24 h-24 mx-auto">
              <img
                src={getUser.pic}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto shadow-md object-cover"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
              />
            </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{getUser.username}</h2>
              <p className="text-gray-500 mt-1">📞 {getUser.phone}</p>
              <p className="text-gray-500">✉️ {getUser.email}</p>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white font-semibold mt-2 py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              onClick={() => { logout(); Navigate("/login"); }}>
                Logout
            </button>
          </div>
          }
  
        <div className="flex items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            className="flex-1 px-4 py-2 border rounded-full text-sm text-white"
          />
          <IoMdAdd
            onClick={addUsers}
            className="text-2xl text-white cursor-pointer hover:text-blue-500"
          />
        </div>

        {/* add user form */}
        {showForm && (
          <div className="bg-gray-100 p-4 rounded-lg mt-4 shadow-md">
            <form className="space-y-3" onSubmit={addContact}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full text-grey-900 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="number"
                placeholder="Phone Number"
                value={newUser.number}
                onChange={(e) => setNewUser({ ...newUser, number: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {/* <FaSearch className="absolute top-2.5 left-3 text-gray-400" /> */}


        <div>
          {searchData.map((curUser) => {
            const fullUser = allUser.find(user => user.phone === curUser.number);
            // console.log(fullUser)
            if (!fullUser) return null;

            return (
              <div
                key={fullUser._id}
                onClick={() => handleSelectUser(fullUser)}
                className={`relative flex items-center p-3 rounded-lg mb-3 cursor-pointer hover:bg-gray-600 ${selectedChat?._id === fullUser._id ? "bg-gray-600" : ""
                  }`}>
                <img src={`${API_BASE}${fullUser.pic}`} alt="" className="w-10 h-10 rounded-full object-cover mr-3" />
                <p className="font-medium text-white">{curUser.username}</p>

                {/* notificatio */}
                {unreadCounts[fullUser._id] > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCounts[fullUser._id]}
                  </span>
                )}
                <p>{onlineUsers.has(fullUser._id) ? "🟢":""}</p>
              
                {/* <p className="text-sm text-gray-500 truncate">{fullUser.phone}</p> */}
                <div className="absolute top-3 right-3">
                  <button onClick={(e) => {
                    e.stopPropagation(); // Prevents selecting the user
                    setDeleteMenu((prevId) => prevId === fullUser._id ? null : fullUser._id);
                  }}>
                    <IoEllipsisVerticalOutline className="text-xl text-gray-900 cursor-pointer mt-2" />
                  </button>

                  {deleteMenu == fullUser._id && (
                    <div className="absolute right-0 mt-4 w-24 bg-white border border-gray-300 shadow-lg rounded-md z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(fullUser)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-grey-900 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    </div>
      )}

      {/* Chat Window */}
      {(!isMobile || (isMobile && !showSidebar)) && (
      <div className={`flex-1 flex flex-col ${isMobile ? 'absolute w-full h-full z-10' : ''}`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-gray-600 shadow-sm flex items-center justify-between relative shadow-2xs">
            {isMobile && (
              <button onClick={() => setShowSidebar(true)} className="text-lg text-gray-900 font-bold mr-4"><TiArrowBack />
              </button>
            )}
              <div>
                <p className="font-semibold text-white text-lg">{selectedCustomName}</p>
                <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                  {isOnline ? "online" : ""}
                </p>
              </div>

              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}>
                  <IoEllipsisVerticalOutline className="text-xl text-gray-900 cursor-pointer" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-md z-10">
                    <button
                      onClick={handleClearChat}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Clear Chat
                    </button>
                    <button
                      onClick={handleRename}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
            </div>



            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-900 bg-[url('/image/icon.png')] 
              bg-no-repeat bg-center">
            <div className={`flex-1 p-4 ${chat != '' && "hidden"}`}>
              <div className="text-center text-gray-400 mt-20">
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 hide-scrollbar">
              {chat.map((msg, i) => {
                const isSentByMe = msg.from === getUser._id;
                return (
                  <div
                    key={i}
                    className={`max-w-xs p-2 rounded-lg text-sm shadow 
                    ${isSentByMe ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
                  >
                    {msg.content}
                  </div>
                );
              })}
            </div>
              {typingUser && (
                <div className="text-sm text-gray-400 italic">
                  <Lottie 
                  options={defaultOptions}
                  width={70}
                  style={{marginBottom:15,marginLeft:0}}>

                  </Lottie>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="flex items-center gap-2 p-4 border-t bg-gray-900">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-500 rounded-full"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              >
                {/* <FaPaperPlane /> */}
                <IoSendOutline />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            <p>{isMobile ? "Select a contact to chat" : "Select a chat to start messaging"}</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
export default ChatDashboard;