import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for GET requests to /api/threshold-ids
export async function GET(request) {
  try {
    // Get the job_id from query params if provided
    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get('job_id');
    
    let apiUrl = `${API_BASE_URL}/api/threshold-ids`;
    if (job_id) {
      apiUrl += `?job_id=${job_id}`;
    }
    
    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
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