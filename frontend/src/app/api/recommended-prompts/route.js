import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for POST requests to /api/recommended-prompts
export async function POST(request) {
  try {
    const requestData = await request.json();
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/recommended-prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from backend API: ${errorText}`);
      return NextResponse.json(
        { error: `Error from backend API: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying API request:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 