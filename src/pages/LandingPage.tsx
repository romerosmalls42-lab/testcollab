import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Hero3D } from '../components/Hero3D'
import { Footer } from '../components/Footer'
import '../components/Hero3D.css'
import '../components/Footer.css'
import './LandingPage.css'

export function LandingPage() {
  const reduceMotion = useReducedMotion()
  const pageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end start'],
  })

  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -48])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, reduceMotion ? 1 : 0.15])

  return (
    <div className="landing" data-testid="parallax-landing" ref={pageRef}>
      <section className="landing__hero">
        <Hero3D />
        <div className="landing__hero-veil" />
        <motion.div
          className="landing__hero-copy"
          style={{ y: copyY, opacity: copyOpacity }}
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
            Three lists in motion. Capture, focus, and finish—without the mental overhead.
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
      </section>

      <Footer />
    </div>
  )
}
