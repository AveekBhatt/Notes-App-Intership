import React, { useState }  from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { useEffect } from "react";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesimg from '../../assets/react.svg';
import NoData from '../../assets/react.svg';
import ChatWidget from "./ChatWidget";



const Home = () =>{

    const [Allnotes , setAllnotes] = useState([]);
    const [openAddEditModal , setopenAddEditModal] = useState({
        isShown : false,
        type : "add",
        data : "null"
    })
  
    const [userinfo , setuserinfo] = useState(null);
    const [isSearch , setisSearch]= useState(false);
    const navigate = useNavigate();

   

    const handleedit = async(noteDetails) =>{
       setopenAddEditModal({isShown : true , type : "edit" , data : noteDetails});
    }
    const getuserinfo = async() =>{
        try{
          let response = await axiosInstance.get("/get-user");
          if(response.data){
            setuserinfo(response.data.user)
          }
        }catch(error){
          console.log(error)
          if(error.response.status == 401){
            localStorage.clear();
            navigate("/login");
          }
        }
    }
    const getAllnotes = async() =>{
       try{
          let response = await axiosInstance.get("/get-all-nodes");
          console.log(response)
          if(response.data && response.data.note){
            setAllnotes(response.data.note);
          }
       }catch(error){
         console.log("ERROR OCCURED")
       }
    }
    const deleteNode = async(data) =>{
       const noteId = data._id;
       try{
          const response = await axiosInstance.delete("/delete-node/" + noteId)
          if(response.data){
             getAllnotes();
             onClose();
          }
       }catch(error){
           if(error.response && error.response.data && error.response.data.message){
              console.log("Error While Deleting")
           }
       }
    }
    const onSearchnote = async(query) =>{
        try{
           const response = await axiosInstance.get("/search-note",{
             params : {query}
           })
        if(response.data && response.data.notes){
            setisSearch(true);
            setAllnotes(response.data.notes)
         }
        }catch(error){
          console.log(error);
        }
    }
    const handleclearnote = () =>{
      setisSearch(false)
      getAllnotes();
    }
    useEffect(()=>{
      getAllnotes();
      getuserinfo();
      return () => {};
    } ,[]);
    console.log(Allnotes)
    return(
        <div>
            <Navbar userinfo={userinfo} onSearchnote={onSearchnote} handleclearnote={handleclearnote}/>
            <div className="flex h-screen">
            <aside className="w-[350px] mr-3 bg-gray-100 border-r p-4">
              <h2 className="text-lg font-semibold mb-6">Last Updated Notes</h2>
              {Allnotes.slice(0, 5).map((item,index)=> {
                  return (
                  <ul key={index} className="space-y-0 mb-10">
                  <li className="cursor-pointer  hover:text-blue-600">Title :  {item.title}</li>
                  <li className="cursor-pointer  hover:text-blue-600">Updated On : {item.updatedAt}</li>
                  <li className="cursor-pointer  hover:text-blue-600">Updated By : {item.updatedBy}</li>
              </ul>
                 );
               })}
            </aside>
            <div className="container mx-auto">
             {Allnotes.length>0 ? (
              <div className="grid grid-cols-3 gap-4 mt-8">
                {Allnotes.map((item,index)=> (
                  <NoteCard 
                  key={item._id}
                  title={item.title}
                  content={item.content}
                  tags={item.tags}
                  summary={item.summary}
                  createdBy={item.createdBy}
                  createdAt={item.createdAt}
                  updatedAt={item.updatedAt}
                  updatedBy={item.updatedBy}
                  onEdit={()=>handleedit(item)}
                  onDelete={()=>deleteNode(item)}
                 />
                ))}
              </div>) 
              : (
                <EmptyCard imgsrc={isSearch ? NoData : AddNotesimg}
                 message={isSearch ? "Oops! . No Matching Node Found" : "Start With Writing Your First Note!! Click the Add Button Below . Start Exploring and Dive into your thoughts"} />
              )}
            </div>
            </div>

            <button  className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-blue-600 fixed right-6 bottom-6 shadow-lg z-50"
             onClick={()=>{
                setopenAddEditModal({isShown : true , type : "add" , data : null});
             }}>
              <MdAdd className="text-[32px] text-white"/>
            </button>

            <Modal 
             isOpen={openAddEditModal.isShown}
             onRequestClose={()=>{}}
             style={{
                overlay : {
                    backgroundColor : "rgba(0,0,0,0.2)",
                },
             }}
             contentLabel= ""
             className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5"
             >
            <AddEditNotes 
              type={openAddEditModal.type}
              notedata={openAddEditModal.data}
              onClose={()=>{
                  setopenAddEditModal({isShown : false , type:"add" , data : null});
              }}
              getAllnotes = {getAllnotes}
            />
            </Modal>
            <ChatWidget />
        </div>
    )
}

export default Home