import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for POST requests to /api/process-prompt
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
      // Note: We're creating a mock response for now, as the actual endpoint might not exist yet
      // In a real implementation, you would replace this with your actual backend API call
      
      // Simulate a processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return a successful mock response
      return NextResponse.json({
        status: 'success',
        prompt: prompt,
        threshold_id: threshold_id,
        processed: true,
        timestamp: new Date().toISOString(),
        message: 'Prompt processed successfully (mock response)'
      });
      
      // Example of actual backend API call:
      /*
      const response = await fetch(`${API_BASE_URL}/api/process-prompt/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(10000),
      });
      
      // Handle response similar to update-dashboard-data route
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
      */
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