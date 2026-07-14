import { useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'

export const ORBIT_CARDS = [
  {
    id: 'backlog',
    title: 'Backlog',
    meta: 'Awaiting pickup',
    benefit: 'Work queued for agents—ideas wait here until an agent claims the brief.',
    tasks: [
      { id: 'roadmap', label: 'Shape Q3 roadmap themes', done: false },
      { id: 'research', label: 'Log customer research asks', done: false },
      { id: 'spike', label: 'Spike auth options', done: false },
    ],
  },
  {
    id: 'doing',
    title: 'Doing',
    meta: 'Agent live',
    benefit: 'Agents actively executing—work moves because they are completing it, not because you dragged it.',
    tasks: [
      { id: 'luna', label: 'Draft the brief for Luna', done: false },
      { id: 'ship', label: 'Ship the landing polish', done: false },
      { id: 'harper', label: 'Reply to Harper', done: false },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    meta: 'Needs you',
    benefit: 'Agent output awaiting human approval—you decide what ships, they did the lift.',
    tasks: [
      { id: 'qa', label: 'QA payment edge cases', done: false },
      { id: 'copy', label: 'Approve launch copy', done: false },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    meta: 'Agent shipped',
    benefit: 'Shipped by your agents—a clear ledger of autonomous work you can trust.',
    tasks: [
      { id: 'onboard', label: 'Ship onboarding v2', done: true },
      { id: 'notify', label: 'Launch notify prefs', done: true },
    ],
  },
] as const

export type OrbitCardId = (typeof ORBIT_CARDS)[number]['id']

type Hero3DProps = {
  reducedMotion?: boolean
  /** Which board card is popped out; -1 keeps all in orbit. */
  activeCard?: number
}

export function Hero3D({ reducedMotion, activeCard = -1 }: Hero3DProps) {
  const prefersReduced = useReducedMotion()
  const shouldReduce = reducedMotion ?? Boolean(prefersReduced)
  const stageRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  })

  const parallaxFarY = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : 120])
  const parallaxMidY = useTransform(scrollYProgress, [0, 1], [0, shouldReduce ? 0 : 70])

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 })
  const springY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 })
  const tiltX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const tiltY = useTransform(springX, [-0.5, 0.5], [-12, 12])

  const featured = activeCard >= 0 ? ORBIT_CARDS[activeCard] : null
  const activeId = featured?.id ?? 'none'
  const tellingStory = activeCard >= 0

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
      className={featured ? 'hero3d hero3d--featuring' : 'hero3d'}
      data-testid="hero-3d-stage"
      data-active-card={activeId}
      data-story={tellingStory ? 'chapter' : 'intro'}
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="hero3d__parallax hero3d__parallax--far"
        data-testid="parallax-depth-far"
        style={{ y: parallaxFarY }}
        aria-hidden="true"
      />
      <motion.div
        className="hero3d__parallax hero3d__parallax--mid"
        data-testid="parallax-depth-mid"
        style={{ y: parallaxMidY }}
        aria-hidden="true"
      />

      <motion.div
        className="hero3d__rig"
        style={
          shouldReduce
            ? undefined
            : {
                rotateX: tiltX,
                rotateY: tiltY,
                transformStyle: 'preserve-3d',
              }
        }
      >
        <motion.div
          className="hero3d__orbit"
          data-testid="todo-orbit-ring"
          animate={
            shouldReduce
              ? undefined
              : tellingStory
                ? { rotate: 0, scale: 0.82 }
                : { rotate: 360, scale: 1 }
          }
          transition={
            shouldReduce
              ? undefined
              : tellingStory
                ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                : {
                    rotate: { duration: 48, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  }
          }
          style={{ transformStyle: 'preserve-3d' }}
        >
          {ORBIT_CARDS.map((card, index) => {
            const orbitAngle = index * 90
            const isGhost = activeCard === index
            const chapterPassed = activeCard > index
            return (
              <motion.div
                key={card.id}
                className={
                  isGhost
                    ? 'hero3d__orbit-slot hero3d__orbit-slot--ghost'
                    : chapterPassed
                      ? 'hero3d__orbit-slot hero3d__orbit-slot--told'
                      : 'hero3d__orbit-slot'
                }
                style={{
                  transform: `rotate(${orbitAngle}deg) translateX(var(--orbit-radius)) rotate(-${orbitAngle}deg)`,
                }}
                initial={
                  shouldReduce
                    ? false
                    : { opacity: 0, scale: 0.55, filter: 'blur(6px)' }
                }
                animate={{
                  opacity: isGhost ? 0.2 : chapterPassed ? 0.45 : 1,
                  scale: 1,
                  filter: 'blur(0px)',
                }}
                transition={{
                  delay: shouldReduce ? 0 : 0.35 + index * 0.22,
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.div
                  className="hero3d__slab"
                  data-testid="todo-orbit-card"
                  data-chapter={card.id}
                  whileHover={
                    shouldReduce
                      ? undefined
                      : {
                          boxShadow:
                            '0 30px 60px rgba(0,0,0,0.45), 0 0 28px rgba(240,215,140,0.28), inset 0 1px 0 rgba(255,255,255,0.55)',
                        }
                  }
                  animate={
                    shouldReduce || tellingStory
                      ? undefined
                      : {
                          rotate: -360,
                          y: [0, -8, 0],
                        }
                  }
                  transition={
                    shouldReduce || tellingStory
                      ? undefined
                      : {
                          rotate: { duration: 48, repeat: Infinity, ease: 'linear' },
                          y: {
                            duration: 5.2 + index * 0.35,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.18,
                          },
                        }
                  }
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="hero3d__card-chrome">
                    <span>{card.title}</span>
                    <span>{card.meta}</span>
                  </div>
                  <p
                    className="hero3d__benefit hero3d__benefit--compact"
                    data-testid={`todo-benefit-${card.id}`}
                  >
                    {card.benefit}
                  </p>
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
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      <div className="hero3d__featured-slot">
        <AnimatePresence mode="wait">
          {featured && (
            <motion.article
              key={featured.id}
              className="hero3d__featured"
              data-testid="todo-featured-card"
              data-column={featured.id}
              data-animate="pop-in"
              initial={
                shouldReduce
                  ? { opacity: 1, scale: 1, x: 0 }
                  : {
                      opacity: 0,
                      scale: 0.42,
                      x: 140,
                      y: 36,
                      rotateY: -32,
                      rotateX: 14,
                      filter: 'blur(8px)',
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                rotateY: 0,
                rotateX: 0,
                filter: 'blur(0px)',
              }}
              exit={
                shouldReduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.78,
                      x: -48,
                      y: -24,
                      rotateY: 12,
                      filter: 'blur(4px)',
                    }
              }
              transition={
                shouldReduce
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 280, damping: 22, mass: 0.75 }
              }
            >
              <motion.div
                className="hero3d__card-chrome hero3d__card-chrome--primary"
                initial={shouldReduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduce ? 0 : 0.08, duration: 0.35 }}
              >
                <span>{featured.title}</span>
                <span>{featured.meta}</span>
              </motion.div>
              <motion.p
                className="hero3d__benefit"
                initial={shouldReduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduce ? 0 : 0.14, duration: 0.4 }}
              >
                {featured.benefit}
              </motion.p>
              <motion.ul
                className="hero3d__task-list"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: shouldReduce ? 0 : 0.07,
                      delayChildren: shouldReduce ? 0 : 0.2,
                    },
                  },
                }}
              >
                {featured.tasks.map((task) => (
                  <motion.li
                    key={task.id}
                    className={
                      task.done ? 'hero3d__task hero3d__task--done' : 'hero3d__task'
                    }
                    variants={{
                      hidden: shouldReduce
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: 16 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <span
                      className={
                        task.done ? 'hero3d__box hero3d__box--checked' : 'hero3d__box'
                      }
                    />
                    <span className="hero3d__label">{task.label}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
