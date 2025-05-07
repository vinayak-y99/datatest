import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for PUT requests to /api/process-prompt
export async function PUT(request) {
  try {
    const requestData = await request.json();
    
    // Validate request data
    if (!requestData.prompt || !requestData.threshold_id) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and threshold_id' },
        { status: 400 }
      );
    }
    
    const { prompt, threshold_id, job_id } = requestData;
    
    console.log(`Processing prompt for threshold_id=${threshold_id}: "${prompt.substring(0, 50)}..."`);
    
    try {
      // Forward the request to the backend prompt processing API
      const response = await fetch(`${API_BASE_URL}/api/process-prompt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(10000),
      });
      
      // Handle response
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.detail || `Error from backend API: ${response.status}` },
            { status: response.status }
          );
        } else {
          const errorText = await response.text();
          return NextResponse.json(
            { error: `Error from backend API: ${response.status}`, details: errorText.substring(0, 500) },
            { status: response.status }
          );
        }
      }
      
      const data = await response.json();
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('Error processing prompt:', fetchError);
      return NextResponse.json(
        { error: `Error processing prompt: ${fetchError.message}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Keep the POST handler for backward compatibility
export async function POST(request) {
  try {
    const requestData = await request.json();
    
    // Validate request data
    if (!requestData.prompt) {
      return NextResponse.json(
        { error: 'Missing prompt in request body' },
        { status: 400 }
      );
    }
    
    const prompt = requestData.prompt;
    const threshold_id = requestData.threshold_id;
    
    console.log(`Processing prompt${threshold_id ? ` for threshold_id=${threshold_id}` : ''}: "${prompt.substring(0, 50)}..."`);
    
    try {
      // Forward the request to the backend prompt processing API
      const response = await fetch(`${API_BASE_URL}/api/process-prompt`, {
        method: 'PUT', // Use PUT for backend API
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(10000),
      });
      
      // Handle response
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.detail || `Error from backend API: ${response.status}` },
            { status: response.status }
          );
        } else {
          const errorText = await response.text();
          return NextResponse.json(
            { error: `Error from backend API: ${response.status}`, details: errorText.substring(0, 500) },
            { status: response.status }
          );
        }
      }
      
      const data = await response.json();
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('Error processing prompt:', fetchError);
      return NextResponse.json(
        { error: `Error processing prompt: ${fetchError.message}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 