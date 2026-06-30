import fs from 'fs/promises';
import path from 'path';

const repos = [
  { name: 'Agent-skills-setup-for-AntiGravity', owner: 'Dokhacgiakhoa', file: 'last-commit-agent-skills.svg', fallbackDate: 'Jun 11, 2026' },
  { name: 'khoa-hoc-tam-linh', owner: 'Dokhacgiakhoa', file: 'last-commit-tam-linh.svg', fallbackDate: 'Dec 31, 2025' },
  { name: 'git-page-3d-infographic', owner: 'Dokhacgiakhoa', file: 'last-commit-infographic.svg', fallbackDate: 'Jun 30, 2026' },
  { name: 'videos-by-AI', owner: 'Dokhacgiakhoa', file: 'last-commit-videos-ai.svg', fallbackDate: 'Jun 23, 2026' },
  { name: 'Office-Box-Academy', owner: 'Dokhacgiakhoa', file: 'last-commit-office-box.svg', fallbackDate: 'Jun 20, 2026' },
  { name: 'CourierXpress', owner: 'dokhacgiakhoa', file: 'last-commit-courier.svg', isPrivate: true, defaultDate: 'Dec 2024' }
];

function createMatrixBadge(dateString) {
  // Matrix Style SVG: Black background, green text, green border, monospace font
  const text = `LAST COMMIT: ${dateString.toUpperCase()}`;
  // Calculate width based on text length to make it look perfectly fitted
  const width = text.length * 7 + 16; 
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20">
  <rect width="${width}" height="20" fill="#000000" rx="3" stroke="#00ff00" stroke-width="1"/>
  <text x="8" y="14" fill="#00ff00" font-family="Consolas, Monaco, 'Courier New', monospace" font-size="11" font-weight="bold" letter-spacing="0.5">${text}</text>
</svg>`;
}

async function generateBadges() {
  const outputDir = 'profile-3d-custom';
  const token = process.env.GITHUB_TOKEN;
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const repo of repos) {
      let dateString = repo.defaultDate || repo.fallbackDate || 'UNKNOWN';
      
      if (!repo.isPrivate) {
        try {
          const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          };
          if (token) {
            headers['Authorization'] = `token ${token}`;
          }
          
          const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`, { headers });
          const data = await res.json();
          
          if (data.pushed_at) {
            const date = new Date(data.pushed_at);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateString = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          } else if (data.message) {
            console.log(`API Warning for ${repo.name}: ${data.message} (Using fallback: ${dateString})`);
          }
        } catch (err) {
          console.error(`Error fetching ${repo.name}:`, err);
        }
      }
      
      const svgContent = createMatrixBadge(dateString);
      const filePath = path.join(outputDir, repo.file);
      await fs.writeFile(filePath, svgContent, 'utf8');
      console.log(`Generated Matrix Badge: ${filePath} -> ${dateString}`);
    }
    console.log('All Matrix Badges generated successfully.');
  } catch (error) {
    console.error('Error generating badges:', error);
  }
}

generateBadges();
