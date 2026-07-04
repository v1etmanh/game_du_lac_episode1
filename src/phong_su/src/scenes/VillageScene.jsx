import { useEffect, useRef } from 'react'

/* ─── Canvas background ─────────────────────────────────── */

function drawVillage(ctx, w, h) {
  // Sky — warm sunset gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65)
  sky.addColorStop(0, '#5b7fba')
  sky.addColorStop(0.45, '#e8a060')
  sky.addColorStop(1, '#f0c060')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h * 0.65)

  // Sun
  const sunGlow = ctx.createRadialGradient(w * 0.72, h * 0.22, 0, w * 0.72, h * 0.22, w * 0.18)
  sunGlow.addColorStop(0, 'rgba(255,230,100,0.9)')
  sunGlow.addColorStop(0.4, 'rgba(255,180,50,0.4)')
  sunGlow.addColorStop(1, 'rgba(255,150,0,0)')
  ctx.fillStyle = sunGlow
  ctx.fillRect(0, 0, w, h * 0.65)

  ctx.fillStyle = '#ffd060'
  ctx.beginPath()
  ctx.arc(w * 0.72, h * 0.22, w * 0.06, 0, Math.PI * 2)
  ctx.fill()

  // Clouds
  drawCloud(ctx, w * 0.12, h * 0.1, 0.9, 'rgba(255,240,200,0.55)')
  drawCloud(ctx, w * 0.45, h * 0.07, 1.1, 'rgba(255,240,200,0.45)')
  drawCloud(ctx, w * 0.82, h * 0.15, 0.7, 'rgba(255,240,200,0.4)')

  // Far hills
  ctx.fillStyle = '#7a9a6a'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.55)
  ctx.bezierCurveTo(w * 0.15, h * 0.3, w * 0.3, h * 0.42, w * 0.45, h * 0.48)
  ctx.bezierCurveTo(w * 0.55, h * 0.52, w * 0.65, h * 0.36, w * 0.8, h * 0.44)
  ctx.bezierCurveTo(w * 0.9, h * 0.49, w, h * 0.4, w, h * 0.55)
  ctx.lineTo(w, h * 0.65)
  ctx.lineTo(0, h * 0.65)
  ctx.closePath()
  ctx.fill()

  // Near hills (darker)
  ctx.fillStyle = '#4e7a45'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.65)
  ctx.bezierCurveTo(w * 0.1, h * 0.52, w * 0.22, h * 0.58, w * 0.38, h * 0.61)
  ctx.bezierCurveTo(w * 0.5, h * 0.63, w * 0.6, h * 0.54, w * 0.75, h * 0.6)
  ctx.bezierCurveTo(w * 0.88, h * 0.65, w, h * 0.58, w, h * 0.65)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  // Ground
  const ground = ctx.createLinearGradient(0, h * 0.65, 0, h)
  ground.addColorStop(0, '#5d8a50')
  ground.addColorStop(1, '#3a6030')
  ctx.fillStyle = ground
  ctx.fillRect(0, h * 0.65, w, h * 0.35)

  // Dirt path
  const pathGrad = ctx.createLinearGradient(0, h * 0.65, 0, h)
  pathGrad.addColorStop(0, '#c4956a')
  pathGrad.addColorStop(1, '#a07040')
  ctx.fillStyle = pathGrad
  ctx.beginPath()
  ctx.moveTo(w * 0.38, h)
  ctx.lineTo(w * 0.62, h)
  ctx.lineTo(w * 0.55, h * 0.65)
  ctx.lineTo(w * 0.45, h * 0.65)
  ctx.closePath()
  ctx.fill()

  // Path stones
  ctx.fillStyle = 'rgba(200,180,150,0.4)'
  for (let i = 0; i < 8; i++) {
    const py = h * 0.68 + i * h * 0.04
    const pw = w * 0.08 + i * w * 0.012
    ctx.beginPath()
    ctx.ellipse(w * 0.5, py, pw, h * 0.008, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Background house (left)
  drawHouse(ctx, w * 0.12, h * 0.56, w * 0.12, h * 0.12, '#8b5e3c', '#c0392b')
  // Background house (right)
  drawHouse(ctx, w * 0.74, h * 0.54, w * 0.14, h * 0.13, '#7a4f2d', '#a03020')

  // Bamboo trees — left cluster
  drawBambooCluster(ctx, w * 0.03, h * 0.65, h, 5, 0.9)
  drawBambooCluster(ctx, w * 0.88, h * 0.65, h, 5, 1.0)

  // Small bamboo mid
  drawBambooCluster(ctx, w * 0.28, h * 0.65, h, 3, 0.65)
  drawBambooCluster(ctx, w * 0.66, h * 0.65, h, 3, 0.7)

  // Title overlay at top
  ctx.fillStyle = 'rgba(20,8,0,0.38)'
  roundRect(ctx, w * 0.18, h * 0.03, w * 0.64, h * 0.1, 10)
  ctx.fill()

  ctx.fillStyle = '#f0d090'
  ctx.font = `bold ${Math.round(h * 0.055)}px 'Be Vietnam Pro', sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('Làng Di Sản Việt Nam', w / 2, h * 0.095)
  ctx.font = `${Math.round(h * 0.03)}px 'Be Vietnam Pro', sans-serif`
  ctx.fillStyle = 'rgba(240,208,144,0.75)'
  ctx.fillText('Chọn người muốn phỏng vấn', w / 2, h * 0.122)
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 28 * scale, 0, Math.PI * 2)
  ctx.arc(x + 30 * scale, y - 8 * scale, 22 * scale, 0, Math.PI * 2)
  ctx.arc(x + 58 * scale, y, 25 * scale, 0, Math.PI * 2)
  ctx.arc(x + 28 * scale, y + 12 * scale, 20 * scale, 0, Math.PI * 2)
  ctx.fill()
}

function drawHouse(ctx, x, y, w, h, wallColor, roofColor) {
  // Wall
  ctx.fillStyle = wallColor
  ctx.fillRect(x, y, w, h)
  // Roof
  ctx.fillStyle = roofColor
  ctx.beginPath()
  ctx.moveTo(x - w * 0.1, y)
  ctx.lineTo(x + w / 2, y - h * 0.55)
  ctx.lineTo(x + w + w * 0.1, y)
  ctx.closePath()
  ctx.fill()
  // Door
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillRect(x + w * 0.38, y + h * 0.55, w * 0.24, h * 0.45)
  // Window
  ctx.fillStyle = 'rgba(255,200,100,0.5)'
  ctx.fillRect(x + w * 0.12, y + h * 0.2, w * 0.28, w * 0.22)
}

function drawBambooCluster(ctx, x, y, canvasH, count, scale) {
  for (let i = 0; i < count; i++) {
    const bx = x + (i - count / 2) * 18 * scale
    const height = canvasH * (0.35 + Math.random() * 0.12) * scale
    const lean = (Math.random() - 0.5) * 0.08

    // Bamboo stalk
    ctx.strokeStyle = `hsl(${100 + i * 5}, 50%, ${25 + i * 3}%)`
    ctx.lineWidth = 5 * scale
    ctx.beginPath()
    ctx.moveTo(bx, y)
    ctx.quadraticCurveTo(bx + lean * height * 2, y - height * 0.5, bx + lean * height, y - height)
    ctx.stroke()

    // Nodes
    const nodeCount = Math.floor(height / (25 * scale))
    for (let n = 0; n < nodeCount; n++) {
      const ny = y - (n + 0.5) * (height / nodeCount)
      ctx.strokeStyle = `hsl(${95 + i * 5}, 45%, 20%)`
      ctx.lineWidth = 6 * scale
      ctx.beginPath()
      ctx.moveTo(bx - 4 * scale, ny)
      ctx.lineTo(bx + 4 * scale, ny)
      ctx.stroke()
    }

    // Leaves
    ctx.fillStyle = `hsl(${105 + i * 8}, 55%, 30%)`
    ctx.save()
    ctx.translate(bx + lean * height, y - height)
    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2 + Math.PI * 0.3
      ctx.save()
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, -12 * scale, 4 * scale, 14 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    ctx.restore()
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/* ─── NPC Card ────────────────────────────────────────────── */

// Đặc điểm hiển thị riêng theo từng NPC (thay vì suy ra 2 vị trí trái/phải
// như trước). Khoá theo npc.id để mở rộng thêm nhân vật dễ dàng.
const NPC_DISPLAY = {
  ong_ba: { icon: '👴', gradient: 'linear-gradient(135deg, #1a237e, #3949ab)' },
  ba_nam: { icon: '👵', gradient: 'linear-gradient(135deg, #8b0000, #c62828)' },
  hung:   { icon: '👨', gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)' },
}

// position: 'left' | 'center' | 'right' — tách phần định vị (wrapper) khỏi
// phần hiệu ứng hover (button) để center dùng transform: translateX(-50%)
// mà không bị hover transform ghi đè lên.
function NPCCard({ npc, onClick, position }) {
  const display = NPC_DISPLAY[npc.id] || { icon: '🧑', gradient: 'linear-gradient(135deg, #555, #888)' }

  const posStyle = position === 'left'
    ? { left: '5%' }
    : position === 'right'
    ? { right: '5%' }
    : { left: '50%', transform: 'translateX(-50%)' }

  return (
    <div style={{ position: 'absolute', bottom: '18%', ...posStyle }}>
    <button
      onClick={onClick}
      style={{
        width: 'clamp(130px, 18%, 200px)',
        background: 'rgba(253,243,227,0.92)',
        border: '3px solid var(--gold)',
        borderRadius: 16,
        padding: '14px 12px',
        cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(30,10,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'var(--font)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
        e.currentTarget.style.boxShadow = '0 12px 36px rgba(30,10,0,0.55)'
        e.currentTarget.style.borderColor = 'var(--wood)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(30,10,0,0.45)'
        e.currentTarget.style.borderColor = 'var(--gold)'
      }}
    >
      {/* Avatar placeholder */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: display.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.8rem',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
        border: '3px solid var(--gold)',
        flexShrink: 0,
      }}>
        {display.icon}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
          {npc.name}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 2 }}>
          {npc.tagline}
        </div>
        <div style={{
          marginTop: 6,
          display: 'inline-block',
          background: 'var(--gold)',
          color: '#3d1f0a',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '2px 10px',
          borderRadius: 10,
        }}>
          {npc.topic}
        </div>
      </div>

      <div style={{
        fontSize: '0.75rem',
        color: 'var(--wood)',
        fontWeight: 600,
        border: '1.5px solid var(--wood-light)',
        borderRadius: 8,
        padding: '4px 14px',
        width: '100%',
        textAlign: 'center',
      }}>
        Phỏng vấn →
      </div>
    </button>
    </div>
  )
}

/* ─── Scene ───────────────────────────────────────────────── */

export default function VillageScene({ npcs, onSelectNPC }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawVillage(ctx, canvas.width, canvas.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {npcs.map((npc, i) => {
        // 2 NPC -> trái/phải như cũ. 3 NPC -> trái/giữa/phải.
        const position = npcs.length >= 3
          ? (i === 0 ? 'left' : i === npcs.length - 1 ? 'right' : 'center')
          : (i === 0 ? 'left' : 'right')
        return (
          <NPCCard
            key={npc.id}
            npc={npc}
            position={position}
            onClick={() => onSelectNPC(npc)}
          />
        )
      })}
    </div>
  )
}
