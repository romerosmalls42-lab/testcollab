import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Hero3D } from '../components/Hero3D'
import { Footer } from '../components/Footer'
import '../components/Hero3D.css'
import '../components/Footer.css'
import './LandingPage.css'

const BEATS = [
  {
    id: 'capture',
    title: 'Capture',
    copy: 'Put the thought down once. No folders, no ceremony—just the next action in ink.',
  },
  {
    id: 'focus',
    title: 'Focus',
    copy: 'Filter to what is live. Everything else waits quietly until you choose it.',
  },
  {
    id: 'finish',
    title: 'Finish',
    copy: 'Cross it off and feel the list get lighter. Progress is the only dashboard.',
  },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0 },
}

export function LandingPage() {
  const reduceMotion = useReducedMotion()
  const firstBeatRef = useRef<HTMLElement>(null)

  return (
    <div className="landing">
      <section className="landing__hero">
        <Hero3D />
        <div className="landing__hero-veil" />
        <div className="landing__hero-copy">
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
            A quieter way to move work forward.
          </motion.h1>
          <motion.p
            className="landing__support"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            One list. Clear next actions. Nothing else competing for your attention.
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
            <button
              type="button"
              className="landing__continue"
              onClick={() =>
                firstBeatRef.current?.scrollIntoView({
                  behavior: reduceMotion ? 'auto' : 'smooth',
                  block: 'start',
                })
              }
            >
              Continue
            </button>
          </motion.div>
        </div>
      </section>

      <div className="landing__disclosure">
        {BEATS.map((beat, index) => (
          <motion.section
            key={beat.id}
            id={beat.id}
            ref={index === 0 ? firstBeatRef : undefined}
            className="landing__beat"
            aria-labelledby={`${beat.id}-title`}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="landing__beat-index">{String(index + 1).padStart(2, '0')}</p>
            <h2 id={`${beat.id}-title`} className="landing__beat-title">
              {beat.title}
            </h2>
            <p className="landing__beat-copy">{beat.copy}</p>
          </motion.section>
        ))}

        <motion.section
          className="landing__finale"
          initial={reduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="landing__finale-title">Your list is waiting.</h2>
          <p className="landing__finale-copy">
            Open To-Do and start with whatever is unfinished. Leave the rest behind.
          </p>
          <Link className="landing__cta landing__cta--finale" to="/tasks">
            Open To-Do
          </Link>
        </motion.section>
      </div>

      <Footer />
    </div>
  )
}
