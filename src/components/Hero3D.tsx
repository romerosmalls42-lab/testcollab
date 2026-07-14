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

export function Hero3D({ reducedMotion }: Hero3DProps) {
  const prefersReduced = useReducedMotion()
  const shouldReduce = reducedMotion ?? Boolean(prefersReduced)
  const stageRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 120, damping: 18, mass: 0.4 })
  const springY = useSpring(rawY, { stiffness: 120, damping: 18, mass: 0.4 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [14, -14])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-18, 18])
  const glareX = useTransform(springX, [-0.5, 0.5], [20, 80])
  const glareY = useTransform(springY, [-0.5, 0.5], [25, 75])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,244,214,0.28), transparent 55%)`

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
          style={{ transform: 'translateZ(-72px) translateY(36px) rotateX(62deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero3d__slab hero3d__slab--mid"
          style={{ transform: 'translateZ(0px) translateY(8px) rotateX(58deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        >
          <span className="hero3d__rule" />
          <span className="hero3d__rule" />
          <span className="hero3d__rule hero3d__rule--active" />
        </motion.div>
        <motion.div
          className="hero3d__slab hero3d__slab--near"
          style={{ transform: 'translateZ(88px) translateY(-24px) rotateX(54deg)' }}
          animate={shouldReduce ? undefined : { y: [0, -14, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <span className="hero3d__check" />
        </motion.div>
        {!shouldReduce && (
          <motion.div className="hero3d__glare" style={{ background: glare }} />
        )}
      </motion.div>
    </div>
  )
}
