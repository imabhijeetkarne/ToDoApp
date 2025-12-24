import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const signUp = async (req , res) =>{
    try {
        let {name , email , password} = req.body;
        let existUser = await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"User already exists"})
        }
        let hashPassword = await bcrypt.hash(password , 10)
        let user = await User.create({name , email , password:hashPassword})
        let token = await genToken(user._id)
        res.cookie("token" , token, {
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })
        return res.status(201).json(user)
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;

         // Validate required fields
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Verify password
        let isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Incorrect password for user:', email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        let token = await genToken(user._id);
        
        // Set cookie
        res.cookie("token" , token, {
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })

        console.log('Login successful for user:', email);
        return res.status(200).json(user);
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logOut = async (req,res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Logout Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
    }
}