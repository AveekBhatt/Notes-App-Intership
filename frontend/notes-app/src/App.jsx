import React  from "react";
import {BrowserRouter as Router , Routes , Route} from "react-router-dom";
import Home from './pages/Home/Home'
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";
import AdminLogin from "./pages/Admin_login/AdminLogin";
import AdminHome from "./pages/AdminHome/AdminHome";

const routes = (
   <Router>
     <Routes>
      <Route path="/dashboard" exact element={<Home/>}></Route>
      <Route path="/login" exact element={<Login/>}></Route>
      <Route path="/signup" exact element={<SignUp/>}></Route>
      <Route path="/adminlogin" exact element={<AdminLogin/>}></Route>
      <Route path="/admindashboard" exact element={<AdminHome/>}></Route>
     </Routes>
   </Router>
)

const App = () =>{
    return(
        <div>{routes}</div>
    )
}

export default App