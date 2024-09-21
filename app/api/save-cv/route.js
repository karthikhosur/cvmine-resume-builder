// app/api/save-cv/route.js
import { NextResponse } from 'next/server';

const CV_MINE_API_URL = 'https://www.cvmine.com/api_in/icrweb/home/save_cv_builder_data?lngId=1&isCVMine=1';

export async function POST(request) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    console.log('Received data:', JSON.stringify(body, null, 2));
    console.log('Received headers:', headers);

    if (!body || !body.data) {
      return NextResponse.json({ status: false, error: 'Invalid payload structure' }, { status: 400 });
    }

    // Make the actual API call to CV Mine
    const cvMineResponse = await fetch(CV_MINE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': headers.token || '',
        'cvbuilder': headers.cvbuilder || '1',
        'ip': headers.ip || '',
        'timestamp': headers.timestamp || '',
        'hash': headers.hash || '',
      },
      body: JSON.stringify(body),
    });

    if (!cvMineResponse.ok) {
      const errorText = await cvMineResponse.text();
      console.error('CV Mine API error:', errorText);
      return NextResponse.json({ status: false, error: `CV Mine API error: ${cvMineResponse.status}` }, { status: cvMineResponse.status });
    }

    const cvMineResult = await cvMineResponse.json();
    console.log('CV Mine API response:', cvMineResult);

    return NextResponse.json(cvMineResult);
  } catch (error) {
    console.error('Error in save-cv route:', error);
    return NextResponse.json({ status: false, error: error.message }, { status: 500 });
  }
}