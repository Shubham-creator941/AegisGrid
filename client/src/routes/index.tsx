import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AppLayout from '../layouts/AppLayout';
import DecisionWorkspace from '../pages/DecisionWorkspace';
import Login from '../pages/Login';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';

import CommandCenter from '../pages/CommandCenter';
import Network from '../pages/Network';
import Events from '../pages/Events';
import Scenarios from '../pages/Scenarios';
import Evaluations from '../pages/Evaluations';
import Recommendations from '../pages/Recommendations';
import Decisions from '../pages/Decisions';
import Audit from '../pages/Audit';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      }
    ],
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="command-center" replace />,
      },
      { path: 'command-center', element: <CommandCenter /> },
      { path: 'network', element: <Network /> },
      { path: 'events', element: <Events /> },
      { path: 'scenarios', element: <Scenarios /> },
      { path: 'evaluations', element: <Evaluations /> },
      { path: 'recommendations', element: <Recommendations /> },
      { path: 'decisions', element: <Decisions /> },
      { path: 'audit', element: <Audit /> },
      {
        path: 'scenarios/:scenarioId/evaluate',
        element: <DecisionWorkspace />,
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
