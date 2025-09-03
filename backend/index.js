require("dotenv").config();

const bcrypt = require("bcrypt");
const config = require("./config.json");
const mongoose = require('mongoose');

mongoose.connect(config.connectionString)

const User = require("./models/user.model")
const Note = require("./models/note.model")
const Admin = require("./models/admin-model")
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const express = require('express');
const cors = require('cors');
const app = express();

const jwt = require("jsonwebtoken");
const  {authenticateToken}  = require('./utilities')

app.use(express.json());

app.use(
    cors({
        origin : "*",
    })
);

app.get("/" , (req,res)=>{
    res.json({data : "hello"});
})
let usersid=null;
app.post("/create-account", async(req,res) =>{
    const {fullname , email , password}  = req.body

    if(!fullname){
        return res.status(400).json({error:true , message:"FullName is Required"});
    }
    if(!email){
        return res.status(400).json({error:true , message:"Email is Required"});
    }
    if(!password){
        return res.status(400).json({error:true , message:"Password is Required"});
    }

    const isUser = await User.findOne({email : email});
    if(isUser){
        return res.json({
            error: true,
            message : "User already exist"
        })
    }
    const user = new User({
        fullname,
        email,
        password
    })
    await user.save();
    const accesstoken = jwt.sign({user} , process.env.ACCESS_TOKEN_SECRET, {
        expiresIn : "36000m",
    })
    return res.json({
        error : false,
        user,
        accesstoken,
        message: 'Registration Successful'
    });
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is Required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is Required" });
    }

    try {
        const userInfo = await User.findOne({ email: email });

        if (!userInfo) {
            return res.status(400).json({ message: "User Not Found" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, userInfo.password);
        if (!isMatch) {
            return res.status(400).json({
                error: true,
                message: "Invalid Credentials"
            });
        }

        // Generate JWT
        const user = { user: userInfo };
        const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accesstoken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

app.post("/add_node" , authenticateToken,  async(req,res)=>{
    const {title  , content , tags , summary} = req.body;
    const {user} = req.user
    console.log(user._id)
    if(!title){
        return res.status(400).json({message : "Title is Required"})
    }
    if(!content){
        return res.status(400).json({message : "Content is Required"})
    }
    if(!summary){
        return res.status(400).json({message : "Summary is Required"})
    }

    try{
           const prompt = `Summarize the following note in 3-4 sentences and suggest 3 tags: Note content: ${content}`;
           const result = await model.generateContent(prompt);
           const response = result.response;
           const text = response.text();
           console.log(text)
           let summary = text;
           let tags = [];

          if (text.includes("Tags:")) {
           const [sumPart, tagPart] = text.split("Tags:");
           summary = sumPart.trim();
            tags = tagPart.split(",").map((t) => t.trim());
          }
           const note = new Note({
            title,
            content,
            tags : tags || [],
            summary,
            createdBy : user._id
        })
        await note.save();
        return res.json({
            error : false,
            note,
            message : "Note Added"
        })
    }catch(error){
        return res.status(400).json({
            error : true ,
            message : "Internal Error"
        })
    }
})
app.put("/edit-node/:noteId" , authenticateToken , async(req,res)=>{
    const noteId = req.params.noteId;
    const {title , content , tags , summary} = req.body;
    const {user} = req.user;
    if(!title && !content && !tags && !summary){
        return res.status(400).json({error : true , message : " No Changes Provided"})
    }
    try{

           const prompt = `Update the following note in 3-4 sentences and suggest 3 tags: Note content: ${content}`;
           const result = await model.generateContent(prompt);
           const response = result.response;
           const text = response.text();
           console.log(text)
           
           let summary = text;
           let tags = [];

           if (text.includes("Tags:")) {
             const [sumPart, tagPart] = text.split("Tags:");
             summary = sumPart.trim();
             tags = tagPart.split(",").map((t) => t.trim());
           }

          const note = await Note.findOne({_id:noteId , createdBy:user._id});
        
         if(!note){
            return res.status(400).json({error : true , message : " No Note Found"});
         }
         if(title) note.title=title;
        if(content) note.content=content;
        if(tags) note.tags=tags;
        if(summary) note.summary = summary;
        note.updatedAt = new Date().getTime();
        await note.save();
        return res.json({
            error : false,
            note,
            message : "Note Updated"
        })
    }
     catch(error){
         return res.status(500).json({error : true , message : "Invalid Operation"})
    }
})

app.get("/get-all-nodes" , authenticateToken , async(req,res)=>{
    const {user} = req.user;
    try{
        const note = await Note.find({createdBy : user._id}).sort({ updatedAt: -1 });
        return res.json({
            error : false,
            note,
        })
    }catch(error){
         return res.status(400).json({
            error : true,
            message : "Error Has Occured",
        })
    }
})

app.delete("/delete-node/:noteId" , authenticateToken , async(req,res) =>{
    const noteId = req.params.noteId;
    const {user} = req.user;
    try{
        const note = await Note.findOne({_id: noteId , createdBy : user._id});
        if(!note){
            return res.status(400).json({
                error : true,
                message : "Note Does not exists"
            })
        }
        await Note.deleteOne({_id:noteId , createdBy : user._id});
        return res.json({
            error : false ,
            message : "Note Deleted"
        })
    }catch(error){
        return res.status(400).json({
            error : true ,
            message : "Error Occured"
        })
    }
})

app.get("/get-user" , authenticateToken , async(req,res)=>{
    const {user} = req.user;
    const isUser = await User.findOne({_id : user._id});
    if(!isUser){
        return res.status(400).json({
            message : "User Does Not Exists"
        })
    }
    return res.json({
        error : false,
        user : {fullname : isUser.fullname , email : isUser.email , createdOn : isUser.createdOn}
    })
})

app.get("/search-note" , authenticateToken , async(req,res) => {
    const {user} = req.user;
    const {query} = req.query;
    if(!query){
        return res.status(400).json({
            error : true,
            message : "Search Query is Required"
        })
    } 
    try{
        const matchingNotes = await Note.find({
            createdBy : user._id,
            $or:[
                {title : { $regex : new RegExp(query,"i")}},
                {content : { $regex : new RegExp(query,"i")}}
            ]
        })

        return res.json({
            error : false,
            notes : matchingNotes,
            message : "Notes Matched Successfully"
        })

    }catch(error){
        return res.status(400).json({
            error : true,
            message : "Interval Server Error"
        })
    }
})

app.put("/admin-edit-node/:noteId" , authenticateToken , async(req,res)=>{
    const noteId = req.params.noteId;
    console.log("noteId")
    const {title , content , tags , summary} = req.body;
    if(!title && !content && !tags && !summary){
        return res.status(400).json({error : true , message : " No Changes Provided"})
    }
    try{
         const prompt = `Update the following note in 3-4 sentences and suggest 3 tags: Note content: ${content}`;
           const result = await model.generateContent(prompt);
           const response = result.response;
           const text = response.text();
           console.log(text)
           
           let summary = text;
           let tags = [];

           if (text.includes("Tags:")) {
             const [sumPart, tagPart] = text.split("Tags:");
             summary = sumPart.trim();
             tags = tagPart.split(",").map((t) => t.trim());
           }

        const note = await Note.findOne({_id:noteId});
        
        if(!note){
            return res.status(400).json({error : true , message : " No Note Found"});
        }
        if(title) note.title=title;
        if(content) note.content=content;
        if(tags) note.tags=tags;
        if(summary) note.summary = summary;
        note.updatedAt = new Date().getTime();
        note.updatedBy = "admin"
        await note.save();
        return res.json({
            error : false,
            note,
            message : "Note Updated By Admin"
        })
    }
     catch(error){
         return res.status(500).json({error : true , message : "Invalid Operation"})
    }
})

app.delete("/admin-delete-node/:noteId" , authenticateToken , async(req,res) =>{
    const noteId = req.params.noteId;
    try{
        const note = await Note.findOne({_id: noteId});
        if(!note){
            return res.status(400).json({
                error : true,
                message : "Note Does not exists"
            })
        }
        await Note.deleteOne({_id:noteId});
        return res.json({
            error : false ,
            message : "Note Deleted"
        })
    }catch(error){
        return res.status(400).json({
            error : true ,
            message : "Error Occured"
        })
    }
})

app.get("/admin-get-all-nodes" , authenticateToken , async(req,res)=>{
    const {user} = req.user;
    try{
        const note = await Note.find().sort({ updatedAt: -1 });
        return res.json({
            error : false,
            note,
        })
    }catch(error){
         return res.status(400).json({
            error : true,
            message : "Error Has Occured",
        })
    }
})

app.get("/admin-get-user" , authenticateToken , async(req,res)=>{
    const {user} = req.user;
    console.log(user)
    const isUser = await Admin.findOne({_id : user._id});
    if(!isUser){
        return res.status(400).json({
            message : "User Does Not Exists"
        })
    }
    return res.json({
        error : false,
        user : {fullname : isUser.fullname , email : isUser.email , createdOn : isUser.createdOn}
    })
})

app.get("/admin-search-note" , authenticateToken , async(req,res) => {
    const {query} = req.query;
    if(!query){
        return res.status(400).json({
            error : true,
            message : "Search Query is Required"
        })
    } 
    try{
        const matchingNotes = await Note.find({
            $or:[
                {title : { $regex : new RegExp(query,"i")}},
                {content : { $regex : new RegExp(query,"i")}}
            ]
        })

        return res.json({
            error : false,
            notes : matchingNotes,
            message : "Notes Matched Successfully"
        })

    }catch(error){
        return res.status(400).json({
            error : true,
            message : "Interval Server Error"
        })
    }
})
app.post("/admin-login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is Required" });
    if (!password) return res.status(400).json({ message: "Password is Required" });

    try {
        const userInfo = await Admin.findOne({ email });

        if (!userInfo) {
            return res.status(400).json({ message: "User Not Found" });
        }

        const isMatch = await bcrypt.compare(password, userInfo.password);
        if (!isMatch) {
            return res.status(400).json({
                error: true,
                message: "Invalid Credentials"
            });
        }

        // Generate JWT with safe fields only
        const payload = { _id: userInfo._id, fullname: userInfo.fullname, email: userInfo.email };
        const accesstoken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m"
        });

        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accesstoken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

app.get("/ai-get-all-nodes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const userQuestion = req.query;
  if (!userQuestion || !userQuestion.query) {
    return res.status(400).json({
      error: true,
      message: "Query parameter is required for AI answer",
    });
  }

  try {
    const notes = await Note.find({ createdBy: user._id }).sort({ updatedAt: -1 });
    const noteData = notes.map(n => ({
      title: n.title,
      summary: n.summary,
      tags: n.tags
    }));

    const notesText = noteData
      .map(n => `Title: ${n.title}\nSummary: ${n.summary}\nTags: ${n.tags.join(", ")}\n`)
      .join("\n");
    
    const safeUserQuestion = userQuestion.query;
    
    const prompt = `You are an AI assistant. Answer the user's question using ONLY the following notes.Notes:${notesText} . Question: ${safeUserQuestion}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return res.json({
      error: false,
      notes,
      answer: responseText,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Error occurred while fetching AI answer",
    });
  }
});

app.post("/admin-create-account", async(req,res) =>{
    const {fullname , email , password}  = req.body

    if(!fullname){
        return res.status(400).json({error:true , message:"FullName is Required"});
    }
    if(!email){
        return res.status(400).json({error:true , message:"Email is Required"});
    }
    if(!password){
        return res.status(400).json({error:true , message:"Password is Required"});
    }

    const isAdmin = await Admin.findOne({email : email});
    if(isAdmin){
        return res.json({
            error: true,
            message : "User already exist"
        })
    }
    const admin = new Admin({
        fullname,
        email,
        password
    })
    await admin.save();
    const accesstoken = jwt.sign({admin} , process.env.ACCESS_TOKEN_SECRET, {
        expiresIn : "36000m",
    })
    return res.json({
        error : false,
        admin,
        accesstoken,
        message: 'Registration Successful'
    });
})
app.listen(8000);
module.exports=app;