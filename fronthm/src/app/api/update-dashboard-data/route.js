import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Handler for PUT requests to /api/update-dashboard-data
export async function PUT(request) {
  try {
    const requestData = await request.json();
    
    // Validate request data
    if (!requestData.threshold_id && !requestData.job_id) {
      return NextResponse.json(
        { error: 'Missing both threshold_id and job_id. At least one is required.' },
        { status: 400 }
      );
    }
    
    if (!requestData.skills_data) {
      return NextResponse.json(
        { error: 'Missing skills_data in request body' },
        { status: 400 }
      );
    }
    
    // Ensure skills_data is a proper object, not an array
    let skills_data = requestData.skills_data;
    if (Array.isArray(skills_data)) {
      console.warn(`Received skills_data as array with ${skills_data.length} items, converting to object`);
      if (skills_data.length > 0) {
        skills_data = skills_data[0]; // Use the first item if array
      } else {
        skills_data = {}; // Empty object if array is empty
      }
      // Update the request data
      requestData.skills_data = skills_data;
    }
    
    console.log(`Updating dashboard data for threshold_id=${requestData.threshold_id}, job_id=${requestData.job_id}`);
    console.log(`skills_data type: ${typeof skills_data}, isArray: ${Array.isArray(skills_data)}`);
    
    try {
      // Forward the request to the backend API
      const response = await fetch(`${API_BASE_URL}/api/update_dashboard_data/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(10000),
      });
      
      // Check if the request was successful
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // It's JSON, we can parse it
          const errorData = await response.json();
          console.error(`JSON error from backend API:`, errorData);
          return NextResponse.json(
            { error: errorData.detail || `Error from backend API: ${response.status} ${response.statusText}` },
            { status: response.status }
          );
        } else {
          // Not JSON, get the text instead
          const errorText = await response.text();
          console.error(`Non-JSON error from backend API: ${errorText.substring(0, 200)}...`);
          return NextResponse.json(
            { error: `Error from backend API: ${response.status} ${response.statusText}`, details: errorText.substring(0, 500) },
            { status: response.status }
          );
        }
      }
      
      // Try to parse the response as JSON
      try {
        const data = await response.json();
        return NextResponse.json(data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        const responseText = await response.text();
        console.error(`Response text (first 200 chars): ${responseText.substring(0, 200)}...`);
        return NextResponse.json(
          { error: 'Invalid JSON response from backend', details: responseText.substring(0, 500) },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      console.error('Error fetching from backend API:', fetchError);
      return NextResponse.json(
        { error: `Backend API error: ${fetchError.message}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 