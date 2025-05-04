#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the dashboard page
const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the indentation and properly use the correct state variables
const fixedContent = content
  // Find any instances of checkboxes with checked prop but no onChange
  .replace(
    /(<label className="relative inline-flex items-center cursor-pointer">\s+)(<input\s+type="checkbox"\s+checked\s+className="sr-only peer"\s+\/>)/g,
    (match, labelStart, checkboxInput, index) => {
      // Determine which checkbox this is based on context
      const beforeMatch = content.substring(Math.max(0, index - 100), index);
      
      if (beforeMatch.includes("Course Updates")) {
        return `${labelStart}<input 
                          type="checkbox" 
                          checked={courseUpdates} 
                          onChange={(e) => setCourseUpdates(e.target.checked)} 
                          className="sr-only peer" 
                        />`;
      } else if (beforeMatch.includes("New Courses")) {
        return `${labelStart}<input 
                          type="checkbox" 
                          checked={newCourses} 
                          onChange={(e) => setNewCourses(e.target.checked)} 
                          className="sr-only peer" 
                        />`;
      }
      
      // Default case, though this shouldn't happen based on the content we've seen
      return match;
    }
  );

// Write the file back
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('Fixed all checkbox inputs in dashboard page');
