import React, { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { useNavigate } from "react-router-dom";
import { ValidateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const AdminLogin = () =>{
    const navigate = useNavigate();
    const [email , setemail] = useState("");
    const [password , setpassword] = useState("");
    const [error , seterror] = useState(null);
    const handlelogin = async (e) =>{
        e.preventDefault();
        if(!ValidateEmail(email)){
            seterror("Please Enter A Valid Email");
            return;
        }
        if(!String(password)){
            seterror("Please Enter the password");
            return ;
        }
        seterror("");
        console.log(email + " " + password)
        try{
            const response = await axiosInstance.post("/admin-login",{
                email : email ,
                password : password
            })
             console.log("HELLO")
            if(response.data && response.data.accesstoken){
                localStorage.setItem("token" , response.data.accesstoken);
                console.log("NAV")
                navigate('/admindashboard')
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
        <div>
         <div className="flex items-center justify-center mt-28">
            <div className="w-96 border rounded bg-white px-7 py-10">
                <form onSubmit={handlelogin}>
                    <h4 className="text-2xl mb-7">Admin Login</h4>
                    <input type="Email" placeholder="Email" className="input-box"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    ></input>
                    <PasswordInput 
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
                    <button type="submit" className="btn-primary">Login</button>
                </form>
            </div>
        </div>
        </div>
    )
}

export default AdminLogin;