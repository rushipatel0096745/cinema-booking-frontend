import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import MovieListPage from "./pages/MovieListPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import Payment from "./pages/Payment";
import SeatPicker from "./pages/SeatPicker";
import Checkout from "./pages/Checkout";
import BookingConfirmation from "./pages/BookingConfirmation";

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
                    <Route path='/dashboard' element={<MovieListPage />} />
                    <Route path='/movies/:id' element={<MovieDetailsPage />} />
                    {/* Add more protected routes here */}
                    <Route path='/showtimes/:showtimeId/seats' element={<SeatPicker />} />
                    <Route path='/checkout/:showtimeId' element={<Checkout />} />
                    <Route path='/payment/:bookingId' element={<Payment />} />
                    <Route path='/booking-confirmation/:bookingId' element={<BookingConfirmation />} />
                </Route>

                <Route path='/' element={<Navigate to='/dashboard' replace />} />
                <Route path='*' element={<Navigate to='/dashboard' replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
