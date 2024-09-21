// app/api/generate-pdf/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const data = await req.json();

  try {
    const response = await fetch(`https://api.parsinga.com/refit-resume-generate-type/?type=${data.templateType}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.resumeData),
    });

    if (!response.ok) {
      console.log(response)
      throw new Error('Failed to generate PDF');
    }

    const pdfBlob = await response.blob();
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}