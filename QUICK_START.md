# Quick Start Guide

Get the application running in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

## 3. Test Without Backend

To test the templates without a real backend, you can modify the orchestrator to use mock data.

### Option A: Use Mock Data in Code

Edit `src/components/TemplateOrchestrator.tsx`:

```typescript
useEffect(() => {
  // Comment out the API call and use mock data
  // const response = await apiService.fetchTemplateConfig();
  
  // Use mock data instead
  const mockConfig = {
    template: 'TEMPLATE_A' as const,
    data: {
      userName: 'John Doe',
      email: 'john@example.com',
      status: 'Premium Member',
      joinDate: '2024-01-15'
    }
  };
  
  setConfig(mockConfig);
  setLoading(false);
}, []);
```

### Option B: Start a Mock Server

Create a simple Node.js mock server:

```bash
# Create mock-server.js in project root
cat > mock-server.js << 'EOF'
const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/template/config') {
    res.writeHead(200);
    res.end(JSON.stringify({
      template: 'TEMPLATE_A',
      data: {
        title: 'Project Dashboard',
        projectName: 'Microfrontends',
        status: 'Active',
        team: '5 members'
      }
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8080, () => {
  console.log('Mock server running on port 8080');
});
EOF

node mock-server.js
```

## 4. Testing the Orchestrator

### Test with Template A

Navigate to the app and you should see:
- Loading spinner briefly
- Template A card layout with your data

### Switch to Template B

Edit the mock data to use:
```typescript
template: 'TEMPLATE_B' as const,
```

You should see:
- Template B grid layout instead

## 5. API Integration

When you have a real backend running:

1. **Ensure backend is running** on `http://localhost:8080`

2. **Provide endpoint** that returns:
   ```json
   {
     "template": "TEMPLATE_A" | "TEMPLATE_B",
     "data": { /* your data */ }
   }
   ```

3. **Update Vite config** (if needed):
   ```typescript
   // vite.config.ts
   proxy: {
     '/api': {
       target: 'http://localhost:8080',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, '')
     }
   }
   ```

4. **Remove mock data** from orchestrator and let it call the API

## 6. Building for Production

```bash
npm run build

# Output will be in dist/ folder
# Serve with any static server:
npx http-server dist
# or
npx serve dist
```

## 7. File Structure Recap

```
microfrontends/
├── src/
│   ├── components/
│   │   ├── TemplateOrchestrator.tsx  ← Main orchestrator
│   │   ├── templates/
│   │   │   ├── TemplateA.tsx         ← Card layout
│   │   │   └── TemplateB.tsx         ← Grid layout
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── styles/
│   │       ├── template.css
│   │       └── loading.css
│   ├── services/
│   │   └── apiService.ts             ← API communication
│   ├── App.tsx
│   ├── main.tsx                      ← Entry point
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 8. Common Issues

### Issue: "Cannot find module '@/services/apiService'"

**Solution**: Check `tsconfig.json` has baseUrl and paths configured:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: API returns 404

**Solution**: Check Vite proxy configuration in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### Issue: CORS errors

**Solution**: Backend needs CORS headers. Example for Spring Boot:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

## 9. Next Steps

1. **Read ARCHITECTURE.md** for deep dive into the design
2. **Modify mock data** to see how templates render different data
3. **Add a new template** following the Template C example in ARCHITECTURE.md
4. **Connect your backend** and test with real data

## 10. Commands Reference

```bash
# Development
npm run dev          # Start dev server on :5173

# Build & Preview
npm run build        # Production build
npm run preview      # Preview production build locally

# Quality
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
npm list             # List installed packages
```

---

**That's it!** You now have a working microfrontends architecture with:
- ✅ Dynamic template selection
- ✅ Two sample template implementations
- ✅ API integration ready
- ✅ Error handling and loading states
- ✅ TypeScript type safety

Happy coding! 🚀
