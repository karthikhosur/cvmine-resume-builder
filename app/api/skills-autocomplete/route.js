import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Read skills from file
    const skillsPath = path.join(process.cwd(), 'data', 'skills.txt');
    const skills = fs.readFileSync(skillsPath, 'utf8').split('\n');

    // Filter skills based on query
    const filteredSkills = skills
      .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions

    return NextResponse.json(filteredSkills);
  } catch (error) {
    console.error('Error reading skills file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}