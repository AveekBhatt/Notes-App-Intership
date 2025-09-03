import React from "react";
import {MdCreate , MdDelete} from 'react-icons/md'
import {MdOutlinePushPin} from 'react-icons/md'
import moment from "moment"
const NoteCard = ({title , content , tags , summary , createdBy , createdAt , updatedAt  , onEdit , onDelete}) =>{
  console.log(onEdit)
   return(
     <div className="w-96  border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
       <div className="flex items-center justify-between">
         <div>
            <h6 className="text-sm font-medium">{title}</h6>
            <span className="text-xs text-slate-500">{ " " + moment(createdAt).format("DD MM YY")}</span>
         </div>
      </div>
       <p className="text-xs text-slate-600 mt-2">{summary}</p>
       <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-slate-500">{tags.map((item)=> (`#${item}`))}</div>
          <div className="flex items-center gap-2">
            <MdCreate className="icon-btn cursor-pointer hover:text-green-600" onClick={onEdit} ></MdCreate>
            <MdDelete className="icon-btn cursor-pointer hover:text-red-600" onClick={onDelete} ></MdDelete>
          </div>
       </div>
     </div>
   )
}

export default NoteCard