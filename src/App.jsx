import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import LifePlan from './pages/LifePlan';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import SelfMastery from './pages/SelfMastery';
import Health from './pages/Health';
import Habits from './pages/Habits';
import Development from './pages/Development';
import Relationships from './pages/Relationships';
import BusinessERP from './pages/BusinessERP';
import CRM from './pages/CRM';
import LeadDetail from './pages/LeadDetail';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import SalesDashboard from './pages/SalesDashboard';
import Execution from './pages/Execution';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="life-plan" element={<LifePlan />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="self-mastery" element={<SelfMastery />} />
          <Route path="self-mastery/health" element={<Health />} />
          <Route path="self-mastery/habits" element={<Habits />} />
          <Route path="self-mastery/development" element={<Development />} />
          <Route path="self-mastery/relationships" element={<Relationships />} />
          <Route path="business" element={<BusinessERP />} />
          <Route path="business/crm" element={<CRM />} />
          <Route path="business/crm/:id" element={<LeadDetail />} />
          <Route path="business/products" element={<Products />} />
          <Route path="business/suppliers" element={<Suppliers />} />
          <Route path="business/sales" element={<SalesDashboard />} />
          <Route path="execution" element={<Execution />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
