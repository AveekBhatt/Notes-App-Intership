import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesimg from '../../assets/react.svg';
import NoData from '../../assets/react.svg';
import axiosInstance from "../../utils/axiosInstance";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import AddEditNotes from "../Home/AddEditNotes";
import Modal from 'react-modal';



const AdminHome = () =>{
     const [Allnotes , setAllnotes] = useState([]);
     const [userinfo , setuserinfo] = useState(null);
     const [isSearch , setisSearch]= useState(false);
     const [openAddEditModal , setopenAddEditModal] = useState({
             isShown : false,
             type : "add",
             data : "null"
    })
     const navigate = useNavigate();
     const handleedit = async(noteDetails) =>{
       setopenAddEditModal({isShown : true , type : "edit" , data : noteDetails});
    }
     const getuserinfo = async() =>{
        try{
          let response = await axiosInstance.get("/admin-get-user");
          if(response.data){
            setuserinfo(response.data.user)
          }
        }catch(error){
          console.log(error)
          if(error.response.status == 401){
            localStorage.clear();
            navigate("/adminlogin");
          }
        }
    }
     const getAllnotes = async() =>{
       try{
          let response = await axiosInstance.get("/admin-get-all-nodes");
          console.log(response)
          if(response.data && response.data.note){
            setAllnotes(response.data.note);
          }
       }catch(error){
         console.log("ERROR OCCURED")
       }
    }
    const onSearchnote = async(query) =>{
        try{
           const response = await axiosInstance.get("/admin-search-note",{
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
     const deleteNode = async(data) =>{
       const noteId = data._id;
       try{
          const response = await axiosInstance.delete("/admin-delete-node/" + noteId)
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
    useEffect(()=>{
          getAllnotes();
          getuserinfo();
          return () => {};
        } ,[]);
    return(
        <div>
         <Navbar userinfo={userinfo} onSearchnote={onSearchnote} handleclearnote={handleclearnote}/>
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
                 message={isSearch ? "Oops! . No Matching Node Found" : "No Notes have been posted"} />
              )}
            </div>
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
        </div>
    )
}
export default AdminHome