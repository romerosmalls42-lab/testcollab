import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Hero3D, ORBIT_CARDS } from '../components/Hero3D'
import { LandingNavbar } from '../components/LandingNavbar'
import { Footer } from '../components/Footer'
import '../components/Hero3D.css'
import '../components/LandingNavbar.css'
import '../components/Footer.css'
import './LandingPage.css'

/** Maps sticky-scroll progress to which board card is featured (-1 = intro). */
export function activeCardFromProgress(progress: number) {
  if (progress < 0.08) return -1
  if (progress < 0.26) return 0
  if (progress < 0.48) return 1
  if (progress < 0.7) return 2
  return 3
}

export function LandingPage() {
  const reduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState(-1)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.35,
    restDelta: 0.001,
  })

  useMotionValueEvent(smoothProgress, 'change', (value) => {
    setActiveCard(activeCardFromProgress(value))
  })

  const introOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.1],
    [1, 1, reduceMotion ? 0.35 : 0],
  )
  const introY = useTransform(smoothProgress, [0, 0.12], [0, reduceMotion ? 0 : -28])
  const hintOpacity = useTransform(smoothProgress, [0, 0.04, 0.1], [1, 1, 0])
  const arrowOpacity = useTransform(smoothProgress, [0, 0.78, 0.9], [1, 0.85, 0])
  const glowOpacity = useTransform(smoothProgress, [0, 0.12, 0.28], [1, 0.7, 0.25])

  return (
    <div className="landing" data-testid="parallax-landing">
      <div className="landing__grain" aria-hidden="true" />
      <LandingNavbar />
      <div
        className="landing__scroll-track"
        data-testid="landing-scroll-track"
        data-scroll-pace="snappy"
        ref={trackRef}
      >
        <div className="landing__sticky">
          <Hero3D activeCard={activeCard} />
          <motion.div
            className="landing__hero-glow"
            style={{ opacity: glowOpacity }}
            aria-hidden="true"
          />
          <div className="landing__hero-veil" />
          <motion.div
            className="landing__scroll-arrow"
            data-testid="landing-scroll-arrow"
            style={{ opacity: arrowOpacity }}
            aria-hidden="true"
          >
            <span className="landing__scroll-arrow-label">Scroll</span>
            <motion.span
              className="landing__scroll-arrow-icon"
              animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.35, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.div>
          <motion.div
            className="landing__hero-copy"
            style={{ opacity: introOpacity, y: introY }}
            aria-hidden={activeCard >= 0}
          >
            <motion.div
              className="landing__brand"
              role="banner"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              To-Do
            </motion.div>
            <motion.h1
              className="landing__headline"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              Let To-Do Manage Your Daily Tasks So You Don&apos;t Have To
            </motion.h1>
            <motion.p
              className="landing__support"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              The one-stop shop for product teams building amazing products.
            </motion.p>
            <motion.div
              className="landing__cta-row"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link className="landing__cta" to="/tasks">
                Start Product Planning
              </Link>
            </motion.div>
            <motion.p className="landing__scroll-hint" style={{ opacity: hintOpacity }}>
              Scroll to explore the board
            </motion.p>
          </motion.div>
        </div>

        <div className="landing__beats" aria-hidden="true">
          {ORBIT_CARDS.map((card) => (
            <div
              key={card.id}
              className="landing__beat-spacer"
              data-testid="landing-scroll-beat"
              data-column={card.id}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
