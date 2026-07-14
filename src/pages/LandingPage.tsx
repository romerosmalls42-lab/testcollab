import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { Hero3D, ORBIT_CARDS } from '../components/Hero3D'
import { Footer } from '../components/Footer'
import '../components/Hero3D.css'
import '../components/Footer.css'
import './LandingPage.css'

function activeCardFromProgress(progress: number) {
  if (progress < 0.14) return -1
  if (progress < 0.36) return 0
  if (progress < 0.58) return 1
  if (progress < 0.8) return 2
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

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setActiveCard(activeCardFromProgress(value))
  })

  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.18],
    [1, 1, reduceMotion ? 0.35 : 0],
  )
  const introY = useTransform(scrollYProgress, [0, 0.2], [0, reduceMotion ? 0 : -36])

  return (
    <div className="landing" data-testid="parallax-landing">
      <div className="landing__scroll-track" data-testid="landing-scroll-track" ref={trackRef}>
        <div className="landing__sticky">
          <Hero3D activeCard={activeCard} />
          <div className="landing__hero-veil" />
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
                Start your list
              </Link>
            </motion.div>
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
