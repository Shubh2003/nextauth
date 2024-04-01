import {connect} from '@/dbConfig/dbConfig';
import User from '@/models/userModel'
import { NextRequest,NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { sendEmail } from '@/helpers/mailer';

export async function POST(request:NextRequest){
    try {
        const reqBody = await request.json();
        const {username,email,password} = reqBody
        console.log(reqBody);

        const user = await User.findOne({email});

        if(user){
            return NextResponse.json({error:"User already exists"},{status:400})
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = bcryptjs.hash(password,salt)      
        
        const newUser =  new User({
            username,
            email,
            password:hashedPassword
        })

       const savedUser =  await newUser.save()
       console.log(savedUser);
        
        await sendEmail({email,emailType:"VERIFY",userId:savedUser})

        return NextResponse.json({
            message:"User registered successfully",
            success:true,
            savedUser
        })
        
    } catch (error:any) {
        return NextResponse.json({error:error.message},{status:500})
    }
}