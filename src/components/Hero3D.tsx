import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

type Hero3DProps = {
  reducedMotion?: boolean
}

const ORBIT_CARDS = [
  {
    id: 'today',
    title: 'Today',
    meta: '1 of 3',
    tasks: [
      { id: 'luna', label: 'Draft the brief for Luna', done: true },
      { id: 'ship', label: 'Ship the landing polish', done: false },
      { id: 'harper', label: 'Reply to Harper', done: false },
    ],
    primary: true,
  },
  {
    id: 'focus',
    title: 'Focus',
    meta: '2',
    tasks: [
      { id: 'deep', label: 'Protect deep work', done: false },
      { id: 'noise', label: 'Cut the noise', done: false },
    ],
    primary: false,
  },
  {
    id: 'done',
    title: 'Done',
    meta: '4',
    tasks: [
      { id: 'archive', label: 'Archive notes', done: true },
      { id: 'receipts', label: 'Sort receipts', done: true },
    ],
    primary: false,
  },
] as const

export function Hero3D({ reducedMotion }: Hero3DProps) {
  const prefersReduced = useReducedMotion()
  const shouldReduce = reducedMotion ?? Boolean(prefersReduced)
  const stageRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  })

  const parallaxFarY = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : 140])
  const parallaxMidY = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : 80])
  const orbitScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduce ? 1 : 0.82])
  const orbitOpacity = useTransform(scrollYProgress, [0, 0.85], [1, shouldReduce ? 1 : 0.35])

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 })
  const springY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 })
  const tiltX = useTransform(springY, [-0.5, 0.5], [10, -10])
  const tiltY = useTransform(springX, [-0.5, 0.5], [-14, 14])

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
      <motion.div
        className="hero3d__parallax hero3d__parallax--far"
        data-testid="parallax-depth-far"
        style={{ y: parallaxFarY }}
      />
      <motion.div
        className="hero3d__parallax hero3d__parallax--mid"
        data-testid="parallax-depth-mid"
        style={{ y: parallaxMidY }}
      />

      <motion.div
        className="hero3d__rig"
        style={
          shouldReduce
            ? { scale: orbitScale, opacity: orbitOpacity }
            : {
                rotateX: tiltX,
                rotateY: tiltY,
                scale: orbitScale,
                opacity: orbitOpacity,
                transformStyle: 'preserve-3d',
              }
        }
      >
        <motion.div
          className="hero3d__orbit"
          data-testid="todo-orbit-ring"
          animate={shouldReduce ? undefined : { rotate: 360 }}
          transition={
            shouldReduce
              ? undefined
              : { duration: 28, repeat: Infinity, ease: 'linear' }
          }
          style={{ transformStyle: 'preserve-3d' }}
        >
          {ORBIT_CARDS.map((card, index) => {
            const orbitAngle = index * 120
            return (
              <div
                key={card.id}
                className="hero3d__orbit-slot"
                style={{
                  transform: `rotate(${orbitAngle}deg) translateX(var(--orbit-radius)) rotate(-${orbitAngle}deg)`,
                }}
              >
                <motion.div
                  className={
                    card.primary
                      ? 'hero3d__slab hero3d__slab--primary'
                      : 'hero3d__slab'
                  }
                  data-testid="todo-orbit-card"
                  animate={
                    shouldReduce
                      ? undefined
                      : {
                          rotate: -360,
                          y: [0, -8, 0],
                        }
                  }
                  transition={
                    shouldReduce
                      ? undefined
                      : {
                          rotate: { duration: 28, repeat: Infinity, ease: 'linear' },
                          y: {
                            duration: 4.8 + index * 0.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.25,
                          },
                        }
                  }
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className={
                      card.primary
                        ? 'hero3d__card-chrome hero3d__card-chrome--primary'
                        : 'hero3d__card-chrome'
                    }
                  >
                    <span>{card.title}</span>
                    <span>{card.meta}</span>
                  </div>
                  <ul className="hero3d__task-list">
                    {card.tasks.map((task) => (
                      <li
                        key={task.id}
                        className={
                          task.done ? 'hero3d__task hero3d__task--done' : 'hero3d__task'
                        }
                      >
                        <span
                          className={
                            task.done ? 'hero3d__box hero3d__box--checked' : 'hero3d__box'
                          }
                        />
                        <span className="hero3d__label">{task.label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
