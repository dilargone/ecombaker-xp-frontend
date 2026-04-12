# Mirage JS Mock API Guide

This project uses **Mirage JS** to mock the backend API for development and testing without needing a real server running.

## 🎭 What is Mirage JS?

Mirage JS is a JavaScript library that lets you build, test, and share a complete working JavaScript application without having to rely on backend services.

## Setup (Already Done ✅)

The Mirage server is automatically initialized when you run the development server. Check `src/main.tsx` - it starts Mirage in development mode.

## 📍 Available Endpoints

### 1. **GET /api/template/config** (Main Endpoint)

Returns a template configuration with randomly selected template (A or B).

**Response:**
```json
{
  "template": "TEMPLATE_A" | "TEMPLATE_B",
  "data": { ... }
}
```

**When it triggers:**
- Every time the app loads or refreshes
- The Orchestrator calls this on mount

### 2. **POST /api/template/select** (Optional - For Programmatic Selection)

Allows you to request a specific template.

**Request:**
```json
{
  "template": "TEMPLATE_A"
}
```

**Response:**
```json
{
  "template": "TEMPLATE_A",
  "data": { ... }
}
```

### 3. **GET /api/template/error** (For Error Testing)

Returns a 500 error to test error handling.

## 🎮 How to Use

### Default Behavior (Random Template)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:5173
   ```

3. **Refresh the page** to see randomly selected templates:
   - Sometimes Template A (card layout)
   - Sometimes Template B (grid layout)

### Load Specific Template via Query String

You can now specify which template to load directly in the URL:

**Load Template A:**
```
http://localhost:5173?template=A
```

**Load Template B:**
```
http://localhost:5173?template=B
```

**How it works:**
1. URL parameter `?template=A` or `?template=B` is read by TemplateOrchestrator
2. Passed to the API service as a query parameter
3. Mirage receives the query parameter and returns the requested template
4. The orchestrator renders that specific template

**Examples:**
```
http://localhost:5173           # Random (Template A or B)
http://localhost:5173?template=A    # Always Template A
http://localhost:5173?template=a    # Always Template A (case-insensitive)
http://localhost:5173?template=B    # Always Template B
http://localhost:5173?template=b    # Always Template B (case-insensitive)
```

### Always Load Template A

Edit `src/mocks/server.ts`:

```typescript
// In the makeServer() function, change this:
if (template && (template === 'TEMPLATE_A' || template === 'TEMPLATE_B')) {
  return templates[template];
}
const randomKey = Math.random() > 0.5 ? 'TEMPLATE_A' : 'TEMPLATE_B';
return templates[randomKey];

// To this (always return Template A):
return templates.TEMPLATE_A;
```

### Always Load Template B

```typescript
return templates.TEMPLATE_B;
```

### Add Custom Data

Edit the template data in `src/mocks/server.ts`:

```typescript
const templates = [
  {
    template: 'TEMPLATE_A',
    data: {
      projectName: 'My Custom Project',  // ← Change this
      status: 'Active',                   // ← Change this
      members: '12 team members',         // ← Add more fields
      // ... more data
    },
  },
  // ...
];
```

### Test Error Handling

Navigate to:
```
http://localhost:5173?test=error
```

Then modify `TemplateOrchestrator.tsx` to call the error endpoint temporarily:

```typescript
// Change this line in useEffect:
const response = await apiService.fetchTemplateConfig();

// To this:
const response = await apiService.get('/template/error');
```

## ⚙️ Configuration

### Query String Parameter Support

The application now supports query string parameters to specify which template to load:

**Parameters:**
- `template=A` - Load Template A
- `template=B` - Load Template B
- No parameter - Random template selection

**Technical Details:**
- Query parameters are case-insensitive (both `A` and `a` work)
- Invalid values fall back to random selection
- Works in development (Mirage) and production (real backend, if implemented)

### URL Examples

```
http://localhost:5173                # Random template
http://localhost:5173?template=A     # Specific: Template A
http://localhost:5173?template=B     # Specific: Template B
http://localhost:5173?template=a     # Specific: Template A (case-insensitive)
http://localhost:5173?template=invalid  # Invalid: Random template
http://localhost:5173?template=A&debug=true  # Multiple parameters
```

### How It Works Internally

1. **TemplateOrchestrator Component**
   - Reads URL query parameters using `URLSearchParams`
   - Extracts `template` parameter if present
   - Passes it to API service

2. **API Service (apiService.ts)**
   - Receives template preference from orchestrator
   - Adds it as query parameter to HTTP request
   - Sends: `GET /api/template/config?template=TEMPLATE_A`

3. **Mirage Mock Server**
   - Receives request with query parameters
   - Checks `request.queryParams.template`
   - Returns requested template or random if not specified

### Enable/Disable Mirage

**File:** `src/mocks/config.ts`

```typescript
export const ENABLE_MIRAGE = import.meta.env.MODE === 'development';
```

- **Currently enabled** in `development` mode (npm run dev)
- **Automatically disabled** in production build (npm run build)

### Adjust Network Latency

**File:** `src/mocks/server.ts`

```typescript
createServer({
  // ...
  timing: 800,  // 800ms delay - adjust this value
})
```

Change `timing: 800` to any value in milliseconds:
- `timing: 0` - No delay
- `timing: 200` - Fast network
- `timing: 2000` - Slow network (good for testing loading states)

## 🧪 Use Cases

### 1. Test Template A Styling
Navigate to:
```
http://localhost:5173?template=A
```
Keep this URL open while designing and refining Template A without worrying about Template B.

### 2. Test Template B Styling
Navigate to:
```
http://localhost:5173?template=B
```
Focus on Template B design and responsiveness.

### 3. Test Random Selection
Navigate to:
```
http://localhost:5173
```
Refresh multiple times to see templates randomly alternate between A and B.

## 📊 Response Examples

### Template A Response
```json
{
  "template": "TEMPLATE_A",
  "data": {
    "projectName": "E-Commerce Platform",
    "status": "Active",
    "members": "8 team members",
    "lastUpdate": "2 hours ago",
    "description": "Main shopping platform",
    "revenue": "$45,000/mo"
  }
}
```

### Template B Response
```json
{
  "template": "TEMPLATE_B",
  "data": {
    "feature1": "Real-time Analytics",
    "feature2": "AI-Powered Recommendations",
    "feature3": "Multi-Channel Support",
    "feature4": "Advanced Inventory Management",
    "feature5": "Integrated Payment Gateway",
    "feature6": "Customer Analytics Dashboard"
  }
}
```

### Error Response
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## 🔄 Switching to Real Backend

When you have a real backend running on `http://localhost:8080`:

### Option 1: Disable Mirage in Code

**File:** `src/mocks/config.ts`

```typescript
// Change this:
export const ENABLE_MIRAGE = import.meta.env.MODE === 'development';

// To this:
export const ENABLE_MIRAGE = false;
```

### Option 2: Environment Variables

Create `.env.local`:
```
VITE_USE_MIRAGE=false
```

Then update config:
```typescript
export const ENABLE_MIRAGE = 
  import.meta.env.MODE === 'development' && 
  import.meta.env.VITE_USE_MIRAGE !== 'false';
```

### Option 3: Query Parameter (Advanced)

Handle in main.tsx:
```typescript
const params = new URLSearchParams(window.location.search);
const useMirage = params.get('mirage') !== 'false';
if (useMirage && ENABLE_MIRAGE) {
  makeServer();
}
```

Then toggle with URLs:
```
http://localhost:5173           // Uses Mirage
http://localhost:5173?mirage=false  // Uses real backend
```

## 📝 Common Tasks

### Task: Add a new template to Mirage

1. Add Template C data:
```typescript
// src/mocks/server.ts
const templates = [
  // ... existing templates
  {
    template: 'TEMPLATE_C',
    data: {
      // Your data here
    },
  },
];
```

2. Create the React component:
```typescript
// src/components/templates/TemplateC.tsx
export const TemplateC = ({ data }) => { ... };
```

3. Update Orchestrator:
```typescript
// src/components/TemplateOrchestrator.tsx
import TemplateC from './templates/TemplateC';

if (config.template === 'TEMPLATE_C') {
  return <TemplateC data={config.data} />;
}
```

### Task: Simulate Slow Network

```typescript
// src/mocks/server.ts
createServer({
  timing: 5000, // 5 seconds
})
```

### Task: Add User Authentication to Mirage

```typescript
this.post('/api/login', (schema, request) => {
  const body = JSON.parse(request.requestBody);
  if (body.email === 'test@example.com') {
    return { token: 'fake-jwt-token', user: { id: 1, name: 'Test User' } };
  }
  return new Response(401, {}, { error: 'Invalid credentials' });
});
```

## 🐛 Troubleshooting

### Issue: Mirage not intercepting API calls

**Solution:** Check the console for:
```
🎭 Mirage JS Mock Server is running
```

If not shown, verify `src/mocks/config.ts` has `ENABLE_MIRAGE = true`.

### Issue: API calls go to real backend instead of Mirage

**Solution:** Make sure Mirage is started **before** the API service makes calls. Verify order in `src/main.tsx`:
```typescript
// Mirage must be initialized BEFORE App mounts
if (ENABLE_MIRAGE) {
  makeServer();
}

ReactDOM.createRoot(...).render(<App />); // App renders after
```

### Issue: Seeing real backend 404 errors

**Solution:** Backend isn't running or proxy isn't configured. If you want to use Mirage instead:
```typescript
// src/mocks/config.ts
export const ENABLE_MIRAGE = true; // Force enable
```

## 📚 References

- [Mirage JS Documentation](https://miragejs.com)
- [Mirage API Reference](https://miragejs.com/api/)
- [Testing with Mirage](https://miragejs.com/docs/testing/)

---

**Happy Mocking!** 🎭

You can now develop the frontend without waiting for the backend team!
