# Microfrontends Architecture Guide

## Overview

This project demonstrates a **microfrontends architecture** using React and TypeScript. The key pattern is:

1. **Single Entry Point**: The app loads a single orchestrator component
2. **Runtime Template Selection**: Backend API determines which template to render
3. **Multiple Templates**: Different UI layouts (Template A, Template B) share the same data interface
4. **Isolated Templates**: Each template is independent and self-contained

## Key Concept: Orchestrator Pattern

The **Orchestrator** is the core component that handles:
- Backend API communication
- Template selection logic
- Loading and error states
- Data passing to selected template

```
User Request
    ↓
TemplateOrchestrator
    ├── Call API: GET /api/template/config
    ├── Parse response.template value
    ├── Render appropriate component
    └── Pass response.data to component
```

## How It Works

### 1. Application Startup

```typescript
// src/main.tsx
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2. App Component

```typescript
// src/App.tsx
<div className="app">
  <header>Microfrontends Architecture</header>
  <main>
    <TemplateOrchestrator /> {/* Mount the orchestrator */}
  </main>
</div>
```

### 3. Orchestrator Component Flow

```typescript
// src/components/TemplateOrchestrator.tsx

useEffect(() => {
  // On mount, fetch template config from backend
  const loadTemplateConfig = async () => {
    const response = await apiService.fetchTemplateConfig();
    // response = { template: 'TEMPLATE_A', data: {...} }
    setConfig(response);
  };
  loadTemplateConfig();
}, []);

// Render based on template value
if (config.template === 'TEMPLATE_A') {
  return <TemplateA data={config.data} />;
} else if (config.template === 'TEMPLATE_B') {
  return <TemplateB data={config.data} />;
}
```

### 4. API Communication

```typescript
// src/services/apiService.ts

async fetchTemplateConfig(): Promise<TemplateResponse> {
  const response = await this.api.get<TemplateResponse>('/template/config');
  return response.data;
}
```

**API Endpoint**: `GET /api/template/config`

**Request Flow**:
```
Frontend: GET /api/template/config
    ↓
Vite Proxy (vite.config.ts)
    ↓ rewrites to /template/config
Backend: GET /template/config
    ↓ returns
Backend Response:
{
  "template": "TEMPLATE_A" | "TEMPLATE_B",
  "data": { ... }
}
```

## Template Structure

### Template Interface

Every template follows this contract:

```typescript
interface TemplateProps {
  data: Record<string, any>;
}

const Template: React.FC<TemplateProps> = ({ data }) => {
  // Render using data
};
```

### Template A: Card-Based Layout

```
┌─────────────────────────────────────┐
│  Template A - Classic Layout        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Primary Information        │   │
│  ├─────────────────────────────┤   │
│  │ Key1: Value1                │   │
│  │ Key2: Value2                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ Action Btn A │ │ Action Btn B │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ Template A • Optimized for desktop  │
└─────────────────────────────────────┘
```

**Use Case**: Displaying structured data (user profile, settings, etc.)

### Template B: Grid Layout

```
┌──────────────────────────────────────┐
│  Template B - Modern Grid Layout     │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Feature1 │  │ Feature2 │         │
│  │ Value1   │  │ Value2   │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌──────────┐                        │
│  │ Feature3 │                        │
│  │ Value3   │                        │
│  └──────────┘                        │
│                                      │
│  [CTA]  [Learn More]  [Contact]    │
│                                      │
├──────────────────────────────────────┤
│ Template B • Responsive grid design  │
└──────────────────────────────────────┘
```

**Use Case**: Displaying multiple features or items (services, products, etc.)

## Data Flow Diagram

```
┌──────────────────────────────────┐
│  Browser loads application       │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  React mounts App component      │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  TemplateOrchestrator mounts     │
│  useEffect triggers API call     │
└────────────┬─────────────────────┘
             │
             ▼
        [LOADING STATE]
      Show LoadingSpinner
             │
             ▼
┌──────────────────────────────────┐
│  API Request                     │
│  GET /api/template/config        │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Backend processes request       │
│  Determines template type        │
│  Prepares data                   │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  API Response Received           │
│  {                               │
│    "template": "TEMPLATE_A",     │
│    "data": { ... }               │
│  }                               │
└────────────┬─────────────────────┘
             │
             ▼
         [CONDITIONAL RENDER]
      Is template === 'TEMPLATE_A'?
             │
      ┌──────┴──────┐
      │             │
     YES           NO
      │             │
      ▼             ▼
  TemplateA    Is template === 'TEMPLATE_B'?
               │
          ┌────┴────┐
         YES       NO
          │         │
          ▼         ▼
      TemplateB   Error UI
```

## Error Handling

### API Error Handling

```typescript
try {
  const response = await apiService.fetchTemplateConfig();
  setConfig(response);
} catch (err) {
  setError(err.message);
  // Show error UI
}
```

### Component Error Handling

```typescript
// ErrorBoundary catches React errors
<ErrorBoundary>
  {config.template === 'TEMPLATE_A' ? (
    <TemplateA data={config.data} />
  ) : (
    <TemplateB data={config.data} />
  )}
</ErrorBoundary>
```

### Retry Mechanism

```typescript
// User-triggered retry
if (error) {
  return (
    <button onClick={() => window.location.reload()}>
      Retry
    </button>
  );
}
```

## Backend Requirements

Your backend should provide an endpoint that:

1. **Authenticates** the request (if needed)
2. **Determines** which template to use based on:
   - User preferences
   - User role/permissions
   - A/B testing configuration
   - Feature flags
   - Business logic
3. **Prepares** the data for the selected template
4. **Returns** a JSON response with:
   - `template`: Template identifier ('TEMPLATE_A' | 'TEMPLATE_B' | ...)
   - `data`: Template-specific payload

### Example Backend Implementation

**Java Spring Boot**:
```java
@GetMapping("/api/template/config")
public ResponseEntity<TemplateResponse> getTemplateConfig() {
    String templateType = determineTemplate(); // Your logic
    Map<String, Object> data = prepareData(templateType);
    return ResponseEntity.ok(new TemplateResponse(templateType, data));
}
```

**Node.js Express**:
```javascript
app.get('/api/template/config', (req, res) => {
  const templateType = determineTemplate(req);
  const data = prepareData(templateType);
  res.json({ template: templateType, data });
});
```

## Extending the Architecture

### Adding Template C

**Step 1**: Create component
```typescript
// src/components/templates/TemplateC.tsx
export const TemplateC = ({ data }) => { ... };
```

**Step 2**: Update types
```typescript
// src/services/apiService.ts
type TemplateType = 'TEMPLATE_A' | 'TEMPLATE_B' | 'TEMPLATE_C';
```

**Step 3**: Update orchestrator
```typescript
// src/components/TemplateOrchestrator.tsx
} else if (config.template === 'TEMPLATE_C') {
  return <TemplateC data={config.data} />;
}
```

### Adding Inter-Template Communication

If templates need to communicate:

```typescript
// Create a context
const TemplateContext = React.createContext({});

// In orchestrator
<TemplateContext.Provider value={{ /* shared data */ }}>
  {config.template === 'TEMPLATE_A' && <TemplateA />}
</TemplateContext.Provider>

// In template
const shared = useContext(TemplateContext);
```

## Performance Considerations

1. **Code Splitting**: Templates can be lazy-loaded
   ```typescript
   const TemplateA = lazy(() => import('./TemplateA'));
   ```

2. **Caching**: Cache template config if stable
   ```typescript
   const cachedTemplate = localStorage.getItem('template');
   ```

3. **Memoization**: Prevent unnecessary re-renders
   ```typescript
   const MemoizedTemplate = React.memo(TemplateA);
   ```

## Testing Strategy

### Unit Tests
- Test template components in isolation with mock data
- Test API service with mocked Axios

### Integration Tests
- Test orchestrator with mocked API responses
- Test full data flow from API to rendered template

### E2E Tests
- Test complete user journey from loading to interaction

## Deployment

### Production Build
```bash
npm run build
# Creates dist folder with optimized bundle
```

### Environment Configuration
```
.env.production
VITE_API_BASE_URL=https://api.example.com
```

### Server Configuration
Ensure your server:
- Serves `index.html` for all routes (SPA routing)
- Proxies `/api` requests to backend
- Sets proper CORS headers
