import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

interface LoginForm {
    email: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();

    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? "/dashboard";

    useEffect(() => {
        clearError();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) clearError();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const result = await login(form);
        if (result.success) navigate(from, { replace: true });
    };

    const isDisabled = isLoading || !form.email || !form.password;

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Welcome back</h1>
                    <p className='text-sm text-gray-500 mt-1'>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className='space-y-5'>
                    {/* Error banner */}
                    {error && (
                        <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg'>
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className='space-y-1.5'>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                            Email
                        </label>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            autoComplete='email'
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder='you@example.com'
                            className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                        />
                    </div>

                    {/* Password */}
                    <div className='space-y-1.5'>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                            Password
                        </label>
                        <div className='relative'>
                            <input
                                id='password'
                                name='password'
                                type={showPassword ? "text" : "password"}
                                autoComplete='current-password'
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder='••••••••'
                                className='w-full px-3.5 py-2.5 pr-16 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((v) => !v)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-800'>
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type='submit'
                        disabled={isDisabled}
                        className='w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-2'>
                        {isLoading ? (
                            <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <p className='text-center text-sm text-gray-500 mt-6'>
                    Don't have an account?{" "}
                    <Link to='/register' className='text-indigo-600 font-medium hover:underline'>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};
