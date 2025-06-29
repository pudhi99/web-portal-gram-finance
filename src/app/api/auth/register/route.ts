import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  await dbConnect();
  //connect
  try {
    const { email, username, password, name, role } = await request.json();
    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email or username already exists." },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email,
      username,
      password: hashedPassword,
      name,
      role: role || "COLLECTOR",
    });
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed." },
      { status: 500 }
    );
  }
}
