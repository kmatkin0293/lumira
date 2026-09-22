import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ThoughtSpotShell from './components/ThoughtSpotShell';
import { TierProvider } from './config/TierContext';
import Sidebar, { SIDEBAR_WIDTH } from './components/NavHeader';
import TopHeader from './components/TopHeader';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import RestockPage from './pages/RestockPage';
import { THOUGHTSPOT_CADENCES_LIVEBOARD_ID } from './config/thoughtspot';
import DashboardHome from './pages/DashboardHome';
import SearchPage from './pages/SearchPage';
import PlaceholderPage from './pages/PlaceholderPage';
import Analytics from './pages/Analytics';
import AskLumiraPage from './pages/AskLumiraPage';
import LiveboardTabPage from './pages/LiveboardTabPage';
import './App.css';

function App() {
  const [signedIn, setSignedIn] = useState<boolean>(
    () => !!localStorage.getItem('vl_auth')
  );

  const handleSignIn = () => {
    localStorage.setItem('vl_auth', '1');
    setSignedIn(true);
  };

  if (!signedIn) {
    return <SignInPage onSignIn={handleSignIn} />;
  }

  return (
    <TierProvider>
      <ThoughtSpotShell>
        <Router>
            <div className="App" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
            <Sidebar />
            <div
              style={{
                marginLeft: SIDEBAR_WIDTH,
                flex: 1,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TopHeader />
              <main style={{ flex: '1 1 auto', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route
                    path="/sales"
                    element={
                      <LiveboardTabPage
                        title="Invoice Processing"
                        description="Invoice volumes, touchless rates, processing times, and exception handling across all AP workflows."
                        liveboardId={THOUGHTSPOT_CADENCES_LIVEBOARD_ID}
                        tabId="3e32920c-eda4-48b0-aee5-96c807c8912c"
                      />
                    }
                  />
                  <Route
                    path="/finance"
                    element={
                      <LiveboardTabPage
                        title="AP Performance"
                        description="Cash discount capture, payment terms compliance, duplicate detection, and supplier KPIs by period."
                        liveboardId={THOUGHTSPOT_CADENCES_LIVEBOARD_ID}
                        tabId="4fb7f49f-406b-45f7-af0a-9002d2ae0486"
                      />
                    }
                  />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/restock" element={<RestockPage />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/ask" element={<AskLumiraPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route
                    path="/pricing"
                    element={<PlaceholderPage title="Procurement Analytics" description="PO matching rates, approval cycle times, supplier spend analysis, and non-PO invoice exceptions." />}
                  />
                  <Route path="/knowledge-hub" element={<PlaceholderPage title="SAP Insights" description="Expert guidance on SAP integration, e-invoicing compliance, and AP automation best practices." />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </ThoughtSpotShell>
    </TierProvider>
  );
}

export default App;
