import React, { useState }  from "react";
import Navbar from "../../components/Navbar/Navbar";
import {Link, useNavigate} from "react-router-dom"
import PasswordInput from "../../components/Input/PasswordInput";
import { ValidateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
const SignUp = () =>{

    const navigate = useNavigate();
    const [name , setname] = useState("");
    const [email , setemail] = useState("");
    const [password , setpassword] = useState("");
    const [error , seterror] = useState(null);

    const handleSignUp = async(e) =>{
        e.preventDefault();
        if(!String(name)){
             seterror("Please Enter A Valid Name");
             return;
        }
        if(!ValidateEmail(email)){
             seterror("Please Enter A Valid Email");
             return;
        }
        if(!String(password)){
          seterror("Please Enter the Password");
            return ;
        }
        seterror("");
        try{
            const response = await axiosInstance.post("/create-account",{
                fullname : name,
                email : email ,
                password : password
            })
            if(response.data && response.data.error){
                seterror(response.data.message)
            }
            if(response.data && response.data.accesstoken){
                localStorage.setItem("token" , response.data.accesstoken);
                navigate('/dashboard')
            }
        }catch(error){
            if(error.response && error.response.data && error.response.data.message){
                seterror(error.response.data.message);
            }
            else{
                seterror("An unexpected error occured")
            }
        }
    }

    return(
         <>
        <div className="flex items-center justify-center mt-28">
            <div className="w-96 border rounded bg-white px-7 py-10">
             <form onSubmit={handleSignUp}>
                 <h4 className="text-2xl mb-7">Sign Up</h4>
                 
                 <input type="text" placeholder="Name" className="input-box"
                     value={name}
                     onChange={(e) => setname(e.target.value)}
                 ></input>

                  <input type="text" placeholder="Email" className="input-box"
                     value={email}
                     onChange={(e) => setemail(e.target.value)}
                 ></input>
                 
                 <PasswordInput 
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                 /> 

                 {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
                    <button type="submit" className="btn-primary">Create Account</button>
                    <p className="text-sm text-center mt-4">
                        Already Registered ?{" "}
                        <Link to="/login" className="font-medium text-primary underline">
                          Login
                        </Link>
                    </p>
             </form>
        </div>
        </div>
        </>
    )
}

export default SignUp