const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PRIMARY_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const SECONDARY_PORT = 5173;

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

const FACILITIES_FILE = path.join(DATA_DIR, 'facilities.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_log.json');
const SEED_FACILITIES_FILE = path.join(DATA_DIR, 'seed_facilities.json');
const SEED_AUDIT_FILE = path.join(DATA_DIR, 'seed_audit.json');

// Ensure seed copies exist for reset feature
if (!fs.existsSync(SEED_FACILITIES_FILE) && fs.existsSync(FACILITIES_FILE)) {
  fs.copyFileSync(FACILITIES_FILE, SEED_FACILITIES_FILE);
}
if (!fs.existsSync(SEED_AUDIT_FILE) && fs.existsSync(AUDIT_FILE)) {
  fs.copyFileSync(AUDIT_FILE, SEED_AUDIT_FILE);
}

// Helpers for JSON files
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return null;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Normalize status matching
function normalizeStatus(st) {
  if (!st) return 'Available';
  const lower = st.toLowerCase().trim();
  if (lower.includes('mod') || lower === 'moderate') return 'Moderate Crowd';
  if (lower.includes('crowd') || lower === 'crowded' || lower === 'busy') return 'Crowded';
  if (lower.includes('close') || lower === 'closed') return 'Closed';
  return 'Available';
}

// Compute aggregate metrics
function computeStats(facilities) {
  const total = facilities.length;
  let available = 0;
  let moderate = 0;
  let crowded = 0;
  let closed = 0;
  let totalWait = 0;
  let waitCount = 0;

  const categoryBreakdown = {};

  facilities.forEach(f => {
    const s = normalizeStatus(f.status);
    if (s === 'Available') available++;
    else if (s === 'Moderate Crowd') moderate++;
    else if (s === 'Crowded') crowded++;
    else if (s === 'Closed') closed++;

    if (s !== 'Closed' && typeof f.estimatedWaitMinutes === 'number') {
      totalWait += f.estimatedWaitMinutes;
      waitCount++;
    }

    if (f.category) {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
    }
  });

  const avgWaitMinutes = waitCount > 0 ? Math.round(totalWait / waitCount) : 0;

  return {
    total,
    available,
    moderate,
    crowded,
    closed,
    avgWaitMinutes,
    categoryBreakdown,
    timestamp: new Date().toISOString()
  };
}

// Main HTTP request handler
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API ROUTES
  if (pathname.startsWith('/api/')) {
    // GET /api/facilities
    if (pathname === '/api/facilities' && method === 'GET') {
      let facilities = readJson(FACILITIES_FILE) || [];
      const { category, status, search } = parsedUrl.query;

      if (category && category !== 'all' && category !== 'All') {
        facilities = facilities.filter(f => f.category && f.category.toLowerCase() === category.toLowerCase());
      }
      if (status && status !== 'all' && status !== 'All') {
        facilities = facilities.filter(f => normalizeStatus(f.status).toLowerCase() === normalizeStatus(status).toLowerCase());
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        facilities = facilities.filter(f =>
          (f.name && f.name.toLowerCase().includes(q)) ||
          (f.category && f.category.toLowerCase().includes(q)) ||
          (f.location && f.location.toLowerCase().includes(q)) ||
          (f.building && f.building.toLowerCase().includes(q)) ||
          (f.room && f.room.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
        );
      }

      return sendJson(res, 200, facilities);
    }

    // GET /api/facilities/:id
    const facilityMatch = pathname.match(/^\/api\/facilities\/([a-zA-Z0-9_-]+)$/);
    if (facilityMatch && method === 'GET') {
      const facilityId = facilityMatch[1];
      const facilities = readJson(FACILITIES_FILE) || [];
      const facility = facilities.find(f => f.id === facilityId);
      if (!facility) {
        return sendJson(res, 404, { error: 'Facility not found', id: facilityId });
      }
      return sendJson(res, 200, facility);
    }

    // POST /api/facilities/:id/status (Status update)
    const statusMatch = pathname.match(/^\/api\/facilities\/([a-zA-Z0-9_-]+)\/status$/);
    if (statusMatch && method === 'POST') {
      const facilityId = statusMatch[1];
      const body = await parseBody(req);
      const facilities = readJson(FACILITIES_FILE) || [];
      const index = facilities.findIndex(f => f.id === facilityId);

      if (index === -1) {
        return sendJson(res, 404, { error: 'Facility not found' });
      }

      const current = facilities[index];
      const newStatus = normalizeStatus(body.status || current.status);

      let waitMinutes = body.estimatedWaitMinutes !== undefined ? Number(body.estimatedWaitMinutes) : current.estimatedWaitMinutes;
      if (isNaN(waitMinutes) || waitMinutes < 0) {
        return sendJson(res, 400, { error: 'Estimated waiting time cannot be negative' });
      }

      let occupancy = body.approximateOccupancy !== undefined ? Number(body.approximateOccupancy) : (current.approximateOccupancy || 0);
      if (isNaN(occupancy) || occupancy < 0) {
        return sendJson(res, 400, { error: 'Occupancy cannot be negative' });
      }

      let capacity = body.capacity !== undefined ? Number(body.capacity) : (current.capacity || 50);
      const crowdPct = capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : (body.crowdPercentage || 50);

      const oldStatus = current.status;
      const updatedTime = new Date().toISOString();
      const updatedBy = body.updatedBy || 'Campus Staff';
      const statusNote = body.statusNote !== undefined ? body.statusNote : (current.statusNote || '');

      facilities[index] = {
        ...current,
        status: newStatus,
        estimatedWaitMinutes: waitMinutes,
        approximateOccupancy: occupancy,
        capacity: capacity,
        crowdPercentage: crowdPct,
        statusNote: statusNote,
        updatedAt: updatedTime,
        updatedBy: updatedBy
      };

      writeJson(FACILITIES_FILE, facilities);

      // Audit log
      const audit = readJson(AUDIT_FILE) || [];
      const auditEntry = {
        id: 'audit-' + Date.now(),
        facilityId: facilityId,
        facilityName: current.name,
        oldStatus: oldStatus,
        newStatus: newStatus,
        approximateOccupancy: occupancy,
        capacity: capacity,
        estimatedWaitMinutes: waitMinutes,
        statusNote: statusNote,
        updatedBy: updatedBy,
        timestamp: updatedTime
      };
      audit.unshift(auditEntry);
      if (audit.length > 50) audit.pop();
      writeJson(AUDIT_FILE, audit);

      return sendJson(res, 200, {
        success: true,
        facility: facilities[index],
        audit: auditEntry
      });
    }

    // POST /api/facilities (Add Facility)
    if (pathname === '/api/facilities' && method === 'POST') {
      const body = await parseBody(req);

      // Validations
      if (!body.name || !body.name.trim()) {
        return sendJson(res, 400, { error: 'Facility Name is required.' });
      }
      if (!body.category || !body.category.trim()) {
        return sendJson(res, 400, { error: 'Facility Category is required.' });
      }
      if (!body.location || !body.location.trim()) {
        return sendJson(res, 400, { error: 'Location is required.' });
      }
      if (!body.description || !body.description.trim()) {
        return sendJson(res, 400, { error: 'Description is required.' });
      }
      if (!body.openingHours || !body.openingHours.trim()) {
        return sendJson(res, 400, { error: 'Opening Hours are required.' });
      }

      let waitMinutes = Number(body.estimatedWaitMinutes);
      if (isNaN(waitMinutes) || waitMinutes < 0) {
        return sendJson(res, 400, { error: 'Estimated waiting time must be a non-negative number.' });
      }

      const validCategories = ['Library', 'Stationery', 'Computer Lab', 'Cafeteria', 'Administrative Office', 'Other Facilities'];
      const matchedCategory = validCategories.find(c => c.toLowerCase() === body.category.trim().toLowerCase()) || body.category.trim();

      const status = normalizeStatus(body.status || 'Available');
      const facilities = readJson(FACILITIES_FILE) || [];

      // Generate clean unique ID
      const baseSlug = body.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24);
      const id = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const capacity = Number(body.capacity) || 50;
      let occupancy = Number(body.approximateOccupancy);
      if (isNaN(occupancy) || occupancy < 0) {
        if (status === 'Available') occupancy = Math.round(capacity * 0.25);
        else if (status === 'Moderate Crowd') occupancy = Math.round(capacity * 0.65);
        else occupancy = Math.round(capacity * 0.90);
      }
      const crowdPercentage = Math.min(100, Math.round((occupancy / capacity) * 100));

      const newFacility = {
        id,
        name: body.name.trim(),
        category: matchedCategory,
        location: body.location.trim(),
        building: body.building || body.location.split(',')[0].trim(),
        floor: body.floor || 'Ground Floor',
        room: body.room || 'General',
        description: body.description.trim(),
        openingHours: body.openingHours.trim(),
        status: status,
        estimatedWaitMinutes: waitMinutes,
        approximateOccupancy: occupancy,
        capacity: capacity,
        crowdPercentage: crowdPercentage,
        updatedAt: new Date().toISOString(),
        updatedBy: body.updatedBy || 'Campus Administrator',
        assignedStaffIds: body.assignedStaffIds || ['user-chief-admin-1', 'user-supervisor-1'],
        statusNote: body.statusNote || 'Newly registered campus facility.',
        hourlyTrends: [15, 30, 50, 65, 60, 65, 55, 45, 35, 20, 10, 5]
      };

      facilities.unshift(newFacility);
      writeJson(FACILITIES_FILE, facilities);

      // Audit log
      const audit = readJson(AUDIT_FILE) || [];
      audit.unshift({
        id: 'audit-' + Date.now(),
        facilityId: id,
        facilityName: newFacility.name,
        oldStatus: 'Created',
        newStatus: newFacility.status,
        approximateOccupancy: occupancy,
        capacity: capacity,
        estimatedWaitMinutes: waitMinutes,
        statusNote: 'Facility added to campus directory.',
        updatedBy: newFacility.updatedBy,
        timestamp: newFacility.updatedAt
      });
      writeJson(AUDIT_FILE, audit);

      return sendJson(res, 201, {
        success: true,
        message: 'Facility created successfully',
        facility: newFacility
      });
    }

    // POST /api/users/profile (Update User Profile & Email)
    if (pathname === '/api/users/profile' && method === 'POST') {
      const body = await parseBody(req);
      const userId = body.userId;
      const email = body.email ? body.email.trim() : '';
      const name = body.name ? body.name.trim() : '';
      const department = body.department ? body.department.trim() : '';

      if (!userId) {
        return sendJson(res, 400, { error: 'User ID is required.' });
      }

      // Email format regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return sendJson(res, 400, { error: 'Please provide a valid email address (e.g. user@campus.edu).' });
      }

      const users = readJson(USERS_FILE) || [];
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return sendJson(res, 404, { error: 'User record not found.' });
      }

      if (name) users[userIndex].name = name;
      users[userIndex].email = email;
      if (department) users[userIndex].department = department;

      writeJson(USERS_FILE, users);

      return sendJson(res, 200, {
        success: true,
        message: 'Profile and email updated successfully.',
        user: users[userIndex]
      });
    }

    // GET /api/stats
    if (pathname === '/api/stats' && method === 'GET') {
      const facilities = readJson(FACILITIES_FILE) || [];
      const stats = computeStats(facilities);
      return sendJson(res, 200, stats);
    }

    // GET /api/audit-log
    if (pathname === '/api/audit-log' && method === 'GET') {
      const audit = readJson(AUDIT_FILE) || [];
      return sendJson(res, 200, audit);
    }

    // GET /api/users
    if (pathname === '/api/users' && method === 'GET') {
      const users = readJson(USERS_FILE) || [];
      return sendJson(res, 200, users);
    }

    // POST /api/reset
    if (pathname === '/api/reset' && method === 'POST') {
      if (fs.existsSync(SEED_FACILITIES_FILE)) {
        fs.copyFileSync(SEED_FACILITIES_FILE, FACILITIES_FILE);
      }
      if (fs.existsSync(SEED_AUDIT_FILE)) {
        fs.copyFileSync(SEED_AUDIT_FILE, AUDIT_FILE);
      }
      return sendJson(res, 200, { success: true, message: 'CampusPulse dataset restored to default!' });
    }

    return sendJson(res, 404, { error: 'API endpoint not found' });
  }

  // STATIC FILE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, safePath);

  if (!path.extname(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (err2, content) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Server error reading file');
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
}

// Start primary server on PORT 3000
const primaryServer = http.createServer(handleRequest);
primaryServer.listen(PRIMARY_PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 CampusPulse running at: http://localhost:${PRIMARY_PORT}/`);
  console.log(`   Tagline: "Know Before You Go."`);
  console.log(`   Theme: Primary Blue (#26658C) + Deep Navy (#023859)`);
  console.log(`=======================================================`);
});

// Also bind secondary port 5173 if different so both URLs work seamlessly
if (SECONDARY_PORT !== PRIMARY_PORT) {
  try {
    const secondaryServer = http.createServer(handleRequest);
    secondaryServer.listen(SECONDARY_PORT, '0.0.0.0', () => {
      console.log(`   Secondary listener active at: http://localhost:${SECONDARY_PORT}/`);
    });
    secondaryServer.on('error', (err) => {
      // Ignore if secondary port in use
    });
  } catch (e) {
    // Ignore
  }
}
