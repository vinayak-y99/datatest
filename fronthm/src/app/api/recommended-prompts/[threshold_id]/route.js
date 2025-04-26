import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for GET requests to /api/recommended-prompts/[threshold_id]
export async function GET(request, { params }) {
  try {
    // Fix: Properly await and destructure params
    const threshold_id = params.threshold_id;
    
    if (!threshold_id) {
      return NextResponse.json(
        { error: 'Missing threshold ID' },
        { status: 400 }
      );
    }
    
    console.log(`Processing GET request for threshold_id: ${threshold_id}`);
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/recommended-prompts/${threshold_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(8000),
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