import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required." }, { status: 400 });
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
    }
    // Create JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Login failed." }, { status: 500 });
  }
} 