const CURVE_DOWN = 'M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z'
const CURVE_UP = 'M0,56 C240,0 480,120 720,88 C960,56 1200,0 1440,56 L1440,120 L0,120 Z'

function WaveDivider({ fromColor = '#fffaf0', toColor = '#f3effe', flip = false }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-16 w-full overflow-hidden sm:h-24"
      style={{ backgroundColor: fromColor }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path d={flip ? CURVE_UP : CURVE_DOWN} fill={toColor} />
      </svg>
    </div>
  )
}

export default WaveDivider
