const fs = require('fs');
const path = require('path');

// 1. Backend Routes Replacement
const routesDir = path.join(__dirname, 'backend', 'routes');
const backendFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

backendFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace router.put('/some/path/:id') with router.post('/some/path/:id/edit')
  content = content.replace(/router\.put\('([^']+)',/g, "router.post('$1/edit',");
  
  // Replace router.delete('/some/path/:id') with router.post('/some/path/:id/delete')
  content = content.replace(/router\.delete\('([^']+)',/g, "router.post('$1/delete',");

  // Fix patch
  content = content.replace(/router\.patch\('([^']+)',/g, "router.post('$1/update',");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated backend route: ${file}`);
});

// 2. Frontend Axios Replacement
function processFrontendDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      processFrontendDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace axios.put(...) -> axios.post(... + '/edit')
      // e.g. axios.put(`/api/team/${id}`) -> axios.post(`/api/team/${id}/edit`)
      const putRegex = /axios\.put\(([`'"])(\/api\/[^`'"]+)\1/g;
      if (putRegex.test(content)) {
        content = content.replace(putRegex, "axios.post($1$2/edit$1");
        changed = true;
      }

      // Replace axios.delete(...) -> axios.post(... + '/delete')
      const delRegex = /axios\.delete\(([`'"])(\/api\/[^`'"]+)\1/g;
      if (delRegex.test(content)) {
        content = content.replace(delRegex, "axios.post($1$2/delete$1");
        changed = true;
      }

      // Replace axios.patch(...) -> axios.post(... + '/update')
      const patchRegex = /axios\.patch\(([`'"])(\/api\/[^`'"]+)\1/g;
      if (patchRegex.test(content)) {
        content = content.replace(patchRegex, "axios.post($1$2/update$1");
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated frontend file: ${item}`);
      }
    }
  }
}

const frontendSrcDir = path.join(__dirname, 'frontend', 'src');
processFrontendDir(frontendSrcDir);

console.log('All replacements done!');
