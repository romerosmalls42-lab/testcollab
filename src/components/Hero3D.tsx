import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

type Hero3DProps = {
  reducedMotion?: boolean
}

const TASKS = [
  { id: 'luna', label: 'Draft the brief for Luna', done: true },
  { id: 'ship', label: 'Ship the landing polish', done: false },
  { id: 'harper', label: 'Reply to Harper', done: false },
  { id: 'review', label: 'Review tomorrow morning', done: false },
] as const

export function Hero3D({ reducedMotion }: Hero3DProps) {
  const prefersReduced = useReducedMotion()
  const shouldReduce = reducedMotion ?? Boolean(prefersReduced)
  const stageRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 })
  const springY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12])
  const glareX = useTransform(springX, [-0.5, 0.5], [20, 80])
  const glareY = useTransform(springY, [-0.5, 0.5], [25, 75])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,244,214,0.22), transparent 52%)`

  function handlePointerMove(event: { clientX: number; clientY: number }) {
    if (shouldReduce || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rawX.set(px)
    rawY.set(py)
  }

  function handlePointerLeave() {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <div
      className="hero3d"
      data-testid="hero-3d-stage"
      aria-hidden="true"
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hero3d__atmosphere" />
      <motion.div
        className="hero3d__rig"
        style={
          shouldReduce
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
        }
      >
        <motion.div
          className="hero3d__slab hero3d__slab--far"
          style={{ transform: 'translate3d(-8%, 10%, -110px) rotateY(18deg) rotateX(8deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="hero3d__card-chrome">
            <span>Later</span>
            <span>3</span>
          </div>
          <ul className="hero3d__task-list hero3d__task-list--muted">
            <li className="hero3d__task">
              <span className="hero3d__box" />
              <span className="hero3d__label">Archive notes</span>
            </li>
            <li className="hero3d__task">
              <span className="hero3d__box" />
              <span className="hero3d__label">Sort receipts</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="hero3d__slab hero3d__slab--mid"
          style={{ transform: 'translate3d(6%, 4%, -48px) rotateY(10deg) rotateX(4deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        >
          <div className="hero3d__card-chrome">
            <span>Active</span>
            <span>2</span>
          </div>
          <ul className="hero3d__task-list hero3d__task-list--muted">
            <li className="hero3d__task">
              <span className="hero3d__box" />
              <span className="hero3d__label">Cut the noise</span>
            </li>
            <li className="hero3d__task">
              <span className="hero3d__box" />
              <span className="hero3d__label">Protect deep work</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="hero3d__slab hero3d__slab--near"
          style={{ transform: 'translate3d(0, 0, 40px) rotateY(-6deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -11, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <div className="hero3d__card-chrome hero3d__card-chrome--primary">
            <span>Today</span>
            <span>1 of 4</span>
          </div>
          <ul className="hero3d__task-list">
            {TASKS.map((task) => (
              <li
                key={task.id}
                className={task.done ? 'hero3d__task hero3d__task--done' : 'hero3d__task'}
              >
                <span className={task.done ? 'hero3d__box hero3d__box--checked' : 'hero3d__box'} />
                <span className="hero3d__label">{task.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {!shouldReduce && (
          <motion.div className="hero3d__glare" style={{ background: glare }} />
        )}
      </motion.div>
    </div>
  )
}
