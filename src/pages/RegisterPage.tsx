import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

interface RegisterForm {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuth();

    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");

    useEffect(() => {
        clearError();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) clearError();
        if (localError) setLocalError("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }
        if (form.password.length < 8) {
            setLocalError("Password must be at least 8 characters");
            return;
        }

        const { confirmPassword: _, ...payload } = form;
        const result = await register(payload);
        if (result.success) navigate("/dashboard", { replace: true });
    };

    const displayError = localError || error;
    const isFormValid = Object.values(form).every(Boolean);

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10'>
            <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Create account</h1>
                    <p className='text-sm text-gray-500 mt-1'>Get started for free</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className='space-y-5'>
                    {/* Error banner */}
                    {displayError && (
                        <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg'>
                            {displayError}
                        </div>
                    )}

                    {/* Name */}
                    <div className='space-y-1.5'>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                            Full name
                        </label>
                        <input
                            id='name'
                            name='name'
                            type='text'
                            autoComplete='name'
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder='John Doe'
                            className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                        />
                    </div>

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

                    {/* Phone */}
                    <div className='space-y-1.5'>
                        <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                            Phone number
                        </label>
                        <input
                            id='phone'
                            name='phone'
                            type='tel'
                            autoComplete='tel'
                            required
                            value={form.phone}
                            onChange={handleChange}
                            placeholder='+91 98765 43210'
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
                                autoComplete='new-password'
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder='Min. 8 characters'
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

                    {/* Confirm Password */}
                    <div className='space-y-1.5'>
                        <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
                            Confirm password
                        </label>
                        <input
                            id='confirmPassword'
                            name='confirmPassword'
                            type={showPassword ? "text" : "password"}
                            autoComplete='new-password'
                            required
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder='••••••••'
                            className='w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type='submit'
                        disabled={isLoading || !isFormValid}
                        className='w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-2'>
                        {isLoading ? (
                            <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <p className='text-center text-sm text-gray-500 mt-6'>
                    Already have an account?{" "}
                    <Link to='/login' className='text-indigo-600 font-medium hover:underline'>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
