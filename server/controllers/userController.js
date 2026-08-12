import Employees from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import FORGOT from '../models/forgotModel.js';
import transporter from '../config/mail.js';
import dotenv from 'dotenv';
dotenv.config()

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const passkey=async(req,res)=>{
    try{
        const key=process.env.KEY;
        const {passkey}=req.body;
        if(key!=passkey){
            return res.status(400).json({
                success:false,
                message:"Passkey Code is Worng"
            });
        }
        return res.status(201).json({
            success:true,
            message:"passkey is Correct"
        });
    }
    catch(err){
        return res.status(404).json({success:false,message:'server Issue'})
    }
};


export const EmpRegister = async (req, res) => {
    console.log("REGISTER BODY:", req.body);

    try {
        const {
            name,
            email,
            phone,
            department,
            password,
            confirm_password,
            role
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !department ||
            !password ||
            !confirm_password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Password confirmation
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            });
        }

        const cleanedPhone = String(phone).replace(/\D/g, "");

        if (cleanedPhone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 10-digit phone number"
            });
        }

        const UserExists = await Employees.findOne({
            email: email.trim().toLowerCase()
        });

        if (UserExists) {
            return res.status(409).json({
                success: false,
                message: "Email already exists. Try another one"
            });
        }

        const hashpass = await bcrypt.hash(password, 10);

        const newuser = new Employees({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: cleanedPhone,
            department: department.trim(),
            password: hashpass,
            role: role || "Employee"
        });

        await newuser.save();

        return res.status(201).json({
            success: true,
            message: "Employee registered successfully",
            user: {
                id: newuser._id,
                name: newuser.name,
                email: newuser.email,
                phone: newuser.phone,
                department: newuser.department,
                role: newuser.role
            }
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: `Invalid Request ${err.message}`
        });
    }
};

export const EmpLogin=async(req,res)=>{
    try{
        const { email, password } = req.body;
        const empdata=await Employees.findOne({email});
        const user = await Employees.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Check your Email & Password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Check your Email & Password" });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
             process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );
        return res.status(200).cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            })
            .json({
                success: true,
                message: "Employee Logged In",
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            });
    }catch(err){
        console.log("LOGIN ERROR:", err);
        return res.status(500).json({success:false,message:"Sorry Invalid Request"});
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email } = payload;

        const user = await Employees.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Sorry, no account found for ${email}. Please register first.`
            });
        }

        const jwtToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            success: true,
            message: "Google Login Success",
            token: jwtToken,
            user
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Google Login Failed" });
    }
};


export const EmpOtp=async(req ,res)=>{
    try{
        const {email}=req.body;
        console.log("Email:", email);
        const userExist=await Employees.findOne({email});
        if(!userExist){
            return res.status(404).json({success:false,message:"User doesnot have any account"});
        }

        const otp=Math.floor(100000 + Math.random()*900000).toString();

        await FORGOT.findOneAndUpdate(
            {email},{
                email,
                otp,
                otpExpiry:Date.now()+5*60*1000
            },
            {
                upsert:true,
                returnDocument:"after"
            }
        );
        await transporter.verify();
        await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:"password Reset OTP",
            text:`Your OTP is ${otp}.It is valid for 5 min`
        });
        return res.status(200).json({success:true,message:"OTP send Successfully"})

    }catch(err){
        console.log(err)
        return res.status(500).json({success:false,message:"Invalid Request"})
    }
};

export const verifyOtp=async(req ,res)=>{
    try{
        const { email, otp }=req.body;
        const otpdata=await FORGOT.findOne({email, otp});
        if(!otpdata){
            return res.status(404).json({success:true,message:"Invalid OTP"})
        }
        if(otpdata.otpExpiry<Date.now()){
            return res.status(400).json({success:false,message:'OTP Expired'});
        }
        return res.status(200).json({success:true,message:"OTP verified SuccessFully"});
    
    }catch(err){
        return res.status(500).json({success:false,message:"Internal server is error"})
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (newPassword != confirmPassword) {
            return res.status(400).json({ success: false, message: "Password Not Match" });
        }
        const user = await Employees.findOne({ email }); // fixed: was undefined "USER"
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();
        await FORGOT.findOneAndDelete({ email });
        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Invalid server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All password fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
        }

        const user = await Employees.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("Change password error:", err.message);
        return res.status(500).json({ success: false, message: "Internal server error changing password" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await Employees.findById(req.user.id).select("-password -confirm_password");
        return res.status(200).json({ success: true, user });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Error fetching profile" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, department } = req.body;
        const updateFields = {};

        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName) {
                return res.status(400).json({ success: false, message: "Name cannot be empty" });
            }
            updateFields.name = trimmedName;
        }

        if (phone !== undefined) {
            updateFields.phone = String(phone).trim();
        }
        
        if (department !== undefined) {
            const userRole = String(req.user?.role || "").toLowerCase();
            if (userRole === "admin" || userRole === "hr" || userRole === "hr manager" || userRole === "hr_manager") {
                updateFields.department = String(department).trim();
            }
        }

        const user = await Employees.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password -confirm_password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (err) {
        console.error("Update profile error:", err.message);
        return res.status(500).json({ success: false, message: err.message || "Error updating profile" });
    }
};