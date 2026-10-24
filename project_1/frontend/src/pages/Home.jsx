import { motion } from 'framer-motion'
import { FiArrowRight, FiHeart, FiMapPin, FiStar } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const slideRight = {
    initial: { opacity: 0, x: 48 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
}

const float = {
    animate: {
        y: [0, -10, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
}

/* ─── AI Match Card ──────────────────────────────────────────── */
const MatchCard = () => (
    <motion.div {...slideRight}>
        <motion.div
            variants={float}
            animate="animate"
            className="bg-white rounded-2xl shadow-2xl shadow-blue-100/60 border border-gray-100 p-6 w-full max-w-sm mx-auto"
        >
            {/* Badge */}
            <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    <HiSparkles className="w-3.5 h-3.5" />
                    AI Recommended
                </span>
                <span className="text-xs text-gray-400">Best match</span>
            </div>

            {/* Volunteer info */}
            <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg select-none">
                    A
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-sm">Ahmed Al-Rashidi</p>
                    <p className="text-xs text-gray-500 mt-0.5">Community Volunteer</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FiStar className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-gray-500 font-medium">Reliability</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">98%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FiMapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-gray-500 font-medium">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">1.2 km</p>
                </div>
            </div>

            {/* Match score bar */}
            <div>
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500 font-medium">Match Score</span>
                    <span className="text-blue-600 font-semibold">94 / 100</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* CTA */}
            <button className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                <FiHeart className="w-4 h-4" />
                Request Assistance
            </button>
        </motion.div>
    </motion.div>
)

/* ─── Home Page ──────────────────────────────────────────────── */
const Home = () => {
    return (
        <section className="py-20 md:py-28 overflow-hidden">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* ── Left: Copy ── */}
                    <div>
                        {/* Eyebrow */}
                        <motion.div {...fadeUp(0)}>
                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-6">
                                <HiSparkles className="w-3.5 h-3.5" />
                                Powered by AI Matching
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            {...fadeUp(0.1)}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
                        >
                            Smart Assistance.{' '}
                            <span className="text-primary">Built for Inclusion.</span>
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            {...fadeUp(0.2)}
                            className="mt-6 text-base md:text-lg text-gray-500 leading-relaxed max-w-lg"
                        >
                            Sanad connects people who need support with trusted volunteers nearby —
                            using intelligent matching to ensure the right help reaches the right person,
                            every time.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            {...fadeUp(0.35)}
                            className="mt-10 flex flex-wrap items-center gap-4"
                        >
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Get Help
                                <FiArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
                            >
                                Become a Volunteer
                            </a>
                        </motion.div>

                        {/* Social proof */}
                        <motion.div
                            {...fadeUp(0.45)}
                            className="mt-10 flex items-center gap-6 text-sm text-gray-400"
                        >
                            <div>
                                <span className="font-bold text-gray-800 text-base">2,400+</span>
                                <p className="text-xs mt-0.5">Volunteers</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div>
                                <span className="font-bold text-gray-800 text-base">98%</span>
                                <p className="text-xs mt-0.5">Match accuracy</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div>
                                <span className="font-bold text-gray-800 text-base">12 min</span>
                                <p className="text-xs mt-0.5">Avg. response</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right: Card ── */}
                    <div className="flex justify-center lg:justify-end">
                        <MatchCard />
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Home
