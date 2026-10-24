import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: connect to Django auth API
        console.log('Login payload:', form)
    }

    return (
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
            <motion.div
                {...fadeUp(0)}
                className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/60 p-8"
            >
                {/* Header */}
                <motion.div {...fadeUp(0.05)} className="mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to your Sanad account
                    </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div {...fadeUp(0.1)}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Email address
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>
                    </motion.div>

                    <motion.div {...fadeUp(0.15)}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        {...fadeUp(0.2)}
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 mt-2"
                    >
                        Sign In
                        <FiArrowRight className="w-4 h-4" />
                    </motion.button>
                </form>

                {/* Footer */}
                <motion.p {...fadeUp(0.25)} className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Sign up
                    </Link>
                </motion.p>
            </motion.div>
        </section>
    )
}

export default Login
