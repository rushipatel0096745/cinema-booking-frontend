import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
// import { DashboardPage } from "./pages/DashboardPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Guest only — redirect to /dashboard if already logged in */}
                <Route element={<GuestRoute />}>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                </Route>

                {/* Protected — redirect to /login if not authenticated */}
                <Route element={<ProtectedRoute />}>
                    <Route path='/dashboard' element={<div className='p-8'>Dashboard 🎉</div>} />
                    {/* Add more protected routes here */}
                </Route>

                <Route path='/' element={<Navigate to='/dashboard' replace />} />
                <Route path='*' element={<Navigate to='/dashboard' replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
