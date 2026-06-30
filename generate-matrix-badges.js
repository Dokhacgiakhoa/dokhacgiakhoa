import fs from 'fs/promises';
import path from 'path';

const repos = [
  { name: 'Agent-skills-setup-for-AntiGravity', owner: 'Dokhacgiakhoa', filePrefix: 'agent-skills', fallbackStars: '457', fallbackDate: 'Jun 11, 2026' },
  { name: 'khoa-hoc-tam-linh', owner: 'Dokhacgiakhoa', filePrefix: 'tam-linh', fallbackStars: '2', fallbackDate: 'Dec 31, 2025' },
  { name: 'git-page-3d-infographic', owner: 'Dokhacgiakhoa', filePrefix: 'infographic', fallbackStars: '0', fallbackDate: 'Jun 30, 2026' },
  { name: 'videos-by-AI', owner: 'Dokhacgiakhoa', filePrefix: 'videos-ai', fallbackStars: '0', fallbackDate: 'Jun 23, 2026' },
  { name: 'Office-Box-Academy', owner: 'Dokhacgiakhoa', filePrefix: 'office-box', fallbackStars: '0', fallbackDate: 'Jun 20, 2026' },
  { name: 'CourierXpress', owner: 'dokhacgiakhoa', filePrefix: 'courier', isPrivate: true, fallbackStars: '0', fallbackDate: 'Dec 2024' }
];

function drawBadge(label, value, valueBgColor = '#00ff00') {
  // Increase padding slightly and use text-anchor="middle" for perfect centering
  const labelWidth = label.length * 6 + 24;
  const valueWidth = value.length * 6 + 24;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <mask id="round-corners">
    <rect width="${totalWidth}" height="20" rx="3" fill="#ffffff" />
  </mask>
  <g mask="url(#round-corners)">
    <rect width="${labelWidth}" height="20" fill="#000000" />
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${valueBgColor}" />
  </g>
  <g fill="#ffffff" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14" text-anchor="middle" fill="#ffffff">${label}</text>
    <text x="${labelWidth + (valueWidth / 2)}" y="14" text-anchor="middle" fill="#000000" font-weight="bold">${value}</text>
  </g>
</svg>`;
}

async function generateBadges() {
  const outputDir = 'profile-3d-custom';
  const token = process.env.GITHUB_TOKEN;
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    for (const repo of repos) {
      let stars = repo.fallbackStars;
      let dateString = repo.fallbackDate;
      
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
          
          if (data.stargazers_count !== undefined) {
            stars = String(data.stargazers_count);
          }
          if (data.pushed_at) {
            const date = new Date(data.pushed_at);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateString = `${months[date.getMonth()]} ${date.getFullYear()}`;
          }
        } catch (err) {
          console.error(`Error fetching ${repo.name}:`, err);
        }
      }
      
      // Generate Stars Badge (only for public repos)
      if (!repo.isPrivate) {
        const starsSvg = drawBadge('Stars', stars);
        const starsPath = path.join(outputDir, `stars-${repo.filePrefix}.svg`);
        await fs.writeFile(starsPath, starsSvg, 'utf8');
        console.log(`Generated Stars Badge: ${starsPath} -> ${stars}`);
      }
      
      // Generate Last Commit Badge
      const commitSvg = drawBadge('Last Commit', dateString);
      const commitPath = path.join(outputDir, `last-commit-${repo.filePrefix}.svg`);
      await fs.writeFile(commitPath, commitSvg, 'utf8');
      console.log(`Generated Commit Badge: ${commitPath} -> ${dateString}`);
    }
    console.log('All Matrix Badges generated successfully.');
  } catch (error) {
    console.error('Error generating badges:', error);
  }
}

generateBadges();
