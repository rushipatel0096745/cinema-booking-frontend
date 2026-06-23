import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useBookingStore } from "../store/bookingStore";
import BookingTimer from "../components/BookingTimer";

// ── Inner form — must be inside <Elements> ───────────────────
function PaymentForm({ bookingId, onExpired }: { bookingId: string; onExpired: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const clearBooking = useBookingStore((s) => s.clearBooking);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePay = async () => {
        if (!stripe || !elements) return;
        setIsProcessing(true);
        setError(null);

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Stripe redirects here on 3DS — we handle it via polling
                return_url: `${window.location.origin}/booking-confirmation/${bookingId}`,
            },
            redirect: "if_required", // only redirect for 3DS, otherwise stay on page
        });

        if (stripeError) {
            setError(stripeError.message ?? "Payment failed. Please try again.");
            setIsProcessing(false);
            return;
        }

        // payment succeeded — navigate to confirmation, polling kicks in there
        navigate(`/booking-confirmation/${bookingId}`);
    };

    return (
        <div className='space-y-6'>
            {error && (
                <div className='px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm'>
                    {error}
                </div>
            )}

            <PaymentElement
                options={{
                    layout: "tabs",
                    defaultValues: { billingDetails: { address: { country: "IN" } } },
                }}
            />

            <button
                onClick={handlePay}
                disabled={!stripe || !elements || isProcessing}
                className='w-full py-4 bg-cinema-accent hover:bg-red-700 disabled:opacity-50
                   disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors'>
                {isProcessing ? "Processing payment..." : "Pay now"}
            </button>

            <div className='flex items-center justify-center gap-2 text-cinema-muted text-xs'>
                <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                        fillRule='evenodd'
                        d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                        clipRule='evenodd'
                    />
                </svg>
                Secured by Stripe
            </div>
        </div>
    );
}

// ── Outer page — loads Stripe + wraps Elements ───────────────
export default function Payment() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const movie = location.state?.movie;
    const showtime = location.state?.showtime;

    const { clientSecret, stripePublishableKey, totalAmount } = useBookingStore();
    const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

    useEffect(() => {
        // if store was cleared (e.g. page refresh), redirect back
        if (!clientSecret || !stripePublishableKey) {
            navigate("/", { replace: true });
            return;
        }
        setStripePromise(loadStripe(stripePublishableKey));
    }, [clientSecret, stripePublishableKey]);

    const handleTimerExpired = () => {
        navigate("/", { replace: true });
    };

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    if (!clientSecret || !stripePromise) return null;

    return (
        <div className='min-h-screen bg-cinema-bg text-white'>
            {/* top bar */}
            <div className='sticky top-0 z-10 bg-cinema-surface border-b border-cinema-border'>
                <div className='max-w-lg mx-auto px-4 py-3 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <button onClick={() => navigate(-1)} className='text-cinema-muted hover:text-white'>
                            ← Back
                        </button>
                        <span className='font-semibold'>Payment</span>
                    </div>
                    <BookingTimer onExpired={handleTimerExpired} />
                </div>
            </div>

            <div className='max-w-lg mx-auto px-4 py-8 space-y-6'>
                {/* booking summary pill */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl p-4 flex gap-3 items-center'>
                    {movie?.poster_url && (
                        <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className='w-12 h-16 object-cover rounded-lg flex-shrink-0'
                        />
                    )}
                    <div className='min-w-0 flex-1'>
                        <p className='font-medium truncate'>{movie?.title}</p>
                        {showtime && (
                            <p className='text-cinema-muted text-sm truncate'>
                                {showtime.theatre?.name} · {formatTime(showtime.starts_at)}
                            </p>
                        )}
                    </div>
                    <div className='text-right flex-shrink-0'>
                        <p className='text-xs text-cinema-muted'>Total</p>
                        <p className='font-semibold'>₹{totalAmount?.toFixed(2)}</p>
                    </div>
                </div>

                {/* Stripe Elements */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl p-5'>
                    <h2 className='font-medium mb-5'>Payment details</h2>
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: "night",
                                variables: {
                                    colorPrimary: "#e50914",
                                    colorBackground: "#1a1a28",
                                    colorText: "#ffffff",
                                    colorTextSecondary: "#6b7280",
                                    colorDanger: "#ef4444",
                                    borderRadius: "8px",
                                    fontFamily: "Inter, system-ui, sans-serif",
                                },
                            },
                        }}>
                        <PaymentForm bookingId={bookingId!} onExpired={handleTimerExpired} />
                    </Elements>
                </div>

                {/* test card hint — remove in production */}
                <div className='px-4 py-3 bg-amber-950 border border-amber-800 rounded-lg'>
                    <p className='text-amber-400 text-xs font-medium mb-1'>Test mode</p>
                    <p className='text-amber-300 text-xs'>
                        Use card <span className='font-mono'>4242 4242 4242 4242</span>, any future date, any CVC
                    </p>
                </div>
            </div>
        </div>
    );
}
