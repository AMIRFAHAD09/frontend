import React from 'react'

function Profile({getUser}) {
console.log(getUser)
    if(!getUser){
        return null;
    }
    
  return (
    <div>
        <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
            <img src="https://via.placeholder.com/100" alt="Profile" className="w-24 h-24 rounded-full mx-auto shadow-md"/>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">{getUser.username}</h2>
            <p className="text-gray-500 mt-1">📞 +1 234 567 890</p>
            <p className="text-gray-500">✉️ {getUser.email}</p>
        </div>

    </div>
  )
}

export default Profile