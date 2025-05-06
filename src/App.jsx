import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import Chain from '../components/chain';
import ChainDetails from '../components/chaindetails';
// import "./App.css"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Chain />} />
          <Route path="/chaindetails" element={<ChainDetails />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
