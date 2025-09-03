import React, { useState }  from "react";
import ProfileCard from "../Cards/ProfileCard";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = ({userinfo , onSearchnote ,  handleclearnote}) =>{
    const [searchQuery , setsearchQuery] = useState("");
    const navigate = useNavigate();
    const onLogout = () =>{
        localStorage.clear();
        navigate("/login")
    }
    const handleSearch = () =>{
       if(searchQuery){
          onSearchnote(searchQuery)
       }
    }
    const onClearSearch = () =>{
        setsearchQuery("");
        handleclearnote()
    }
    return(
        <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
           <h2 className="text-xl font medium text-black py-2">Notes</h2>
           <SearchBar value={searchQuery}
               onChange={({target}) => {
                  setsearchQuery(target.value) 
               }}
               handleSearch={handleSearch}
               onClearSearch={onClearSearch}
           />
           <ProfileCard userinfo={userinfo} onLogout={onLogout}/>
        </div>
    )
}

export default Navbar