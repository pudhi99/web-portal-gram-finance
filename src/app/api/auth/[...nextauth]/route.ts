import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { handleCors, corsHeaders } from '@/lib/cors'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse
  
  const response = await handler(request)
  Object.entries(corsHeaders(request)).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse
  
  const response = await handler(request)
  Object.entries(corsHeaders(request)).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
} 