# Microfrontends Architecture - React + TypeScript

A modern microfrontends application using React and TypeScript with an orchestrator pattern that dynamically renders different UI templates based on backend configuration.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────┐
│           Frontend App (React)           │
├─────────────────────────────────────────┤
│      TemplateOrchestrator Component      │
│   (Manages backend communication)        │
├──────────────┬──────────────────────────┤
│              │                          │
│         API Service                     │
│   (Handles /api/template/config)        │
│              │                          │
└──────────────┼──────────────────────────┘
               │
        ┌──────▼────────┐
        │   Backend     │
        │ Determines    │
        │ Template Type │
        │ & Provides    │
        │ Data          │
        └───────────────┘

        Template Decision
             │
    ┌────────┴────────┐
    │                 │
  ┌─▼──┐          ┌───▼──┐
  │ A  │          │  B   │
  └────┘          └──────┘
   Card        Grid Layout
```

## 🚀 Features

- **Dynamic Template Rendering**: Backend decides which template to render
- **Type-Safe**: Full TypeScript support with proper typing
- **Error Handling**: Error boundaries and comprehensive error states
- **Loading States**: Beautiful loading spinners while fetching data
- **API Integration**: Axios-based API service with proper error handling
- **Responsive Design**: Both templates work on all screen sizes
- **Modular Architecture**: Clean separation of concerns

## 📁 Project Structure

```
src/
├── components/
│   ├── TemplateOrchestrator.tsx    # Main orchestrator component
│   ├── templates/
│   │   ├── TemplateA.tsx           # Classic card-based layout
│   │   └── TemplateB.tsx           # Modern grid layout
│   ├── LoadingSpinner.tsx          # Loading state component
│   ├── ErrorBoundary.tsx           # React error boundary
│   └── styles/
│       ├── template.css            # Template styling
│       └── loading.css             # Loading spinner styling
├── services/
│   └── apiService.ts               # API communication layer
├── App.tsx                         # Main app component
├── App.css                         # App styling
├── main.tsx                        # Entry point
└── index.css                       # Global styles
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd microfrontends

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔌 Backend Integration

The orchestrator fetches template configuration from:
```
GET /api/template/config
```

### Expected Response Format

```json
{
  "template": "TEMPLATE_A" | "TEMPLATE_B",
  "data": {
    "key1": "value1",
    "key2": "value2"
  },
  "message": "Optional message"
}
```

### Example Responses

**For Template A:**
```json
{
  "template": "TEMPLATE_A",
  "data": {
    "title": "User Profile",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "Active"
  }
}
```

**For Template B:**
```json
{
  "template": "TEMPLATE_B",
  "data": {
    "feature1": "Advanced Analytics",
    "feature2": "Real-time Monitoring",
    "feature3": "Custom Dashboard"
  }
}
```

## 🔧 API Service Usage

The `apiService` is a singleton that handles all backend communication:

```typescript
import apiService from '@/services/apiService';

// Fetch template config
const config = await apiService.fetchTemplateConfig();

// Generic GET
const data = await apiService.get<DataType>('/endpoint');

// Generic POST
const result = await apiService.post<ResultType>('/endpoint', payload);

// Generic PUT
const updated = await apiService.put<UpdatedType>('/endpoint', data);

// Generic DELETE
const deleted = await apiService.delete<DeleteResponse>('/endpoint');
```

## 🎨 Component Hierarchy

```
App
└── TemplateOrchestrator
    ├── LoadingSpinner (while loading)
    ├── ErrorBoundary
    │   ├── TemplateA (if template === 'TEMPLATE_A')
    │   └── TemplateB (if template === 'TEMPLATE_B')
    └── Error UI (if error occurs)
```

## 📝 Creating a New Template

To add a new template (e.g., Template C):

1. **Create the component** (`src/components/templates/TemplateC.tsx`):

```typescript
import React from 'react';
import '../styles/template.css';

interface TemplateCProps {
  data: Record<string, any>;
}

const TemplateC: React.FC<TemplateCProps> = ({ data }) => {
  return (
    <div className="template template-c">
      {/* Your template UI */}
    </div>
  );
};

export default TemplateC;
```

2. **Update the Orchestrator** (`src/components/TemplateOrchestrator.tsx`):

```typescript
import TemplateC from './templates/TemplateC';

// In the render logic:
{config.template === 'TEMPLATE_A' ? (
  <TemplateA data={config.data} />
) : config.template === 'TEMPLATE_B' ? (
  <TemplateB data={config.data} />
) : config.template === 'TEMPLATE_C' ? (
  <TemplateC data={config.data} />
) : (
  // Error handling
)}
```

3. **Update the API service type** (`src/services/apiService.ts`):

```typescript
interface TemplateResponse {
  template: 'TEMPLATE_A' | 'TEMPLATE_B' | 'TEMPLATE_C';
  data: Record<string, any>;
}
```

## 🧪 Testing the Application

### Using a Mock Backend

For development without a real backend, you can mock the API response:

```typescript
// src/components/TemplateOrchestrator.tsx
useEffect(() => {
  // Mock data for testing
  const mockConfig = {
    template: 'TEMPLATE_A' as const,
    data: {
      title: 'Test Data',
      description: 'This is mock data',
    },
  };
  setConfig(mockConfig);
  setLoading(false);
}, []);
```

### With a Real Backend

Make sure your backend is running and the proxy is configured in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 🚦 State Flow

```
TemplateOrchestrator mounts
        ↓
Fetch /api/template/config
        ↓
Loading = true (show spinner)
        ↓
Response received
        ↓
Loading = false
        ↓
Render appropriate template based on `template` field
        ↓
User interacts with template
```

## ⚙️ Configuration

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### API Service Config (`src/services/apiService.ts`)

```typescript
this.api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 📦 Dependencies

- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - DOM rendering
- **axios**: ^1.6.0 - HTTP client
- **typescript**: ^5.2.2 - Type safety

## 🎯 Best Practices

1. **Type Safety**: Always define interfaces for API responses
2. **Error Handling**: Use error boundaries and catch API errors
3. **Loading States**: Always show feedback while fetching data
4. **Component Reusability**: Make templates generic with data props
5. **Separation of Concerns**: Keep API logic in services, UI in components
6. **Responsive Design**: Test on mobile, tablet, and desktop

## 🔐 Security Considerations

- Validate all data received from the backend
- Sanitize user inputs if templates accept interactive elements
- Use HTTPS in production
- Implement proper authentication/authorization at the backend
- Never expose sensitive data in frontend code

## 📚 References

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

## 📝 License

MIT

## 🤝 Contributing

This is a template project. Feel free to extend and customize based on your requirements!
