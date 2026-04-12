import TemplateOrchestrator from './components/TemplateOrchestrator';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Microfrontends Architecture</h1>
        <p>Dynamic Template Rendering Based on Backend Configuration</p>
      </header>
      
      <main className="app-main">
        <TemplateOrchestrator />
      </main>

      <footer className="app-footer">
        <p>© 2024 Microfrontends App | Template-based UI orchestration</p>
      </footer>
    </div>
  );
}

export default App;
