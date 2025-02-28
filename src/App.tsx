import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CustomersPage from "./components/dashboard/CustomersPage";
import SalesPage from "./components/dashboard/SalesPage";
import ProductsPage from "./components/dashboard/ProductsPage";
import PropertiesPage from "./components/dashboard/PropertiesPage"; // Added import
import ContasAPagar from "./components/dashboard/ContasAPagar";
import ContasAReceber from "./components/dashboard/ContasReceber";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/customers">
                  <CustomersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/sales">
                  <SalesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/products">
                  <ProductsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties" // Added route
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/properties">
                  <PropertiesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/team" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/settings" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro/contas-pagar"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/financeiro/contas-pagar">
                  <ContasAPagar />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro/contas-receber"
            element={
              <ProtectedRoute>
                <DashboardLayout activePath="/financeiro/contas-receber">
                  <ContasAReceber />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
