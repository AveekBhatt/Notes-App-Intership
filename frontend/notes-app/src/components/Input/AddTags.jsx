import React, { useState } from "react";
import {MdAdd , MdClose} from "react-icons/md"
const AddTags = ({tags , settags}) =>{
    const [inputTag , setinputTag] = useState("");
    const handleInputChange = (e) =>{
        setinputTag(e.target.value);
    }
    const addNewTag = () =>{
        if(!inputTag.trim()!==""){
            settags([...tags,inputTag.trim()]);
            setinputTag("");
        }
    }
    const handleKeydown = (e) =>{
       if(e.key==="Enter"){
          addNewTag();
       }
    }
    const handleRemoveTag = (tagremove) =>{
        settags(tags.filter((tag) => tag!==tagremove));
    }
    return (
        <div>
        {tags?.length>0 &&  (
            <div className="flex items-center gap-2 flax-wrap mt-2">
            {tags.map((tag,index) => {
                <span key={index} className="">
                    #{tag}
                    <button onClick={() => {handleRemoveTag(tag)}}>
                        <MdClose/>
                    </button>
                </span>
            })}
        </div>)}
        <div className="flex items-center gap-4 mt-3">
            <input type="text" className="text-sm bg-transparent border px-3 py-2 rounded outline-none" 
            onChange={handleInputChange}
            onKeyDown={handleKeydown} 
            placeholder="Add Tags"></input>

            <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700"
              onClick={()=>{
                addNewTag();
              }}
            >
            <MdAdd className="text-2xl text-blue-700 hover:text-red"/> 
            </button>
        </div>
        </div>
    )
}

export default AddTags