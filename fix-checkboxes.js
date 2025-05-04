#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the dashboard page
const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix checkboxes with 'checked' prop but no 'onChange' handler
content = content.replace(
  /<input type="checkbox" checked className="sr-only peer" \/>/g,
  `<input 
    type="checkbox" 
    checked={courseUpdates} 
    onChange={(e) => setCourseUpdates(e.target.checked)} 
    className="sr-only peer" 
  />`
);

// Fix the second occurrence (for New Courses)
content = content.replace(
  /<input type="checkbox" checked className="sr-only peer" \/>/g,
  `<input 
    type="checkbox" 
    checked={newCourses} 
    onChange={(e) => setNewCourses(e.target.checked)} 
    className="sr-only peer" 
  />`
);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed checkbox inputs in dashboard page');
