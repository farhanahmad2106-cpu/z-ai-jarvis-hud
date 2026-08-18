import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET() {
  try {
    // Locate where you pasted the markdown files
    const skillsDirectory = path.join(process.cwd(), 'public/skills-library/skills');
    
    if (!fs.existsSync(skillsDirectory)) {
      return NextResponse.json({ error: "Skills directory not found inside public/" }, { status: 404 });
    }

    const filenames = fs.readdirSync(skillsDirectory);

    // Read and structure the first 10 skills just to verify everything works
    const quickCatalog = filenames
      .filter(file => file.endsWith('.md'))
      .slice(0, 10)
      .map((filename) => {
        const filePath = path.join(skillsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        return {
          id: filename.replace('.md', ''),
          name: data.name || filename.replace('.md', '').toUpperCase(),
          description: data.description || 'Custom Agentic Playbook',
        };
      });

    return NextResponse.json({ success: true, totalSkillsFound: filenames.length, sample: quickCatalog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}