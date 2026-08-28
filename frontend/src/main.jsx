import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './Authcontext.jsx'
import ProjectRoutes from './Route.jsx'
import { BrowserRouter as Router } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
       <Router>
            <ProjectRoutes/>
       </Router>
  </AuthProvider>
)
