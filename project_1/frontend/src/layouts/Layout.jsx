import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
    const { pathname } = useLocation()

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === to ? 'text-primary' : 'text-gray-600'
                }`}
        >
            {label}
        </Link>
    )

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <nav className="container flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-primary tracking-tight">
                    Sanad
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLink('/', 'Home')}
                    {navLink('/register', 'Volunteer')}
                </div>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>
    )
}

const Footer = () => (
    <footer className="border-t border-gray-100 bg-gray-50">
        <div className="container py-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sanad. All rights reserved.
        </div>
    </footer>
)

const Layout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
)

export default Layout
