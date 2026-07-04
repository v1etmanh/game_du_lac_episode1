import { useState, useEffect } from 'react'
import VillageScene from './scenes/VillageScene.jsx'
import InterviewScene from './scenes/InterviewScene.jsx'
import NewspaperScene from './scenes/NewspaperScene.jsx'
import ongBaData from './data/npc_oanquan.json'
import baNamData from './data/npc_danbau.json'
import hungData from './data/npc_hung.json'

const ALL_NPCS = [ongBaData, hungData, baNamData]

/* ─── Completion screen ──────────────────────────────────── */
function CompletionScreen({ npcData, onReturn, onMakeNewspaper }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 40%, #5c3d1e, #1a0a00)',
      gap: 20,
      padding: 24,
      textAlign: 'center',
    }}>
      <style>{`
        @keyframes completionFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      <div style={{ fontSize: '4rem', animation: 'starSpin 2s ease infinite' }}>🌟</div>

      <div style={{
        animation: 'completionFade 0.6s ease',
        background: 'rgba(253,243,227,0.95)',
        borderRadius: 20,
        padding: '28px 36px',
        border: '3px solid var(--gold)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        maxWidth: 420,
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Phỏng Vấn Hoàn Thành!
        </div>
        <div style={{ color: 'var(--wood)', fontSize: '0.95rem', marginBottom: 4 }}>
          Bạn đã ghi chép đầy đủ về
        </div>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--red)',
          marginBottom: 16,
        }}>
          {npcData.topic}
        </div>
        <div style={{
          fontSize: '0.88rem',
          color: 'var(--text-mid)',
          fontStyle: 'italic',
          fontFamily: 'var(--font-serif)',
          lineHeight: '1.6',
          marginBottom: 20,
        }}>
          "{npcData.name} mỉm cười và gật đầu hài lòng. Cuốn sổ của bạn đã có thêm những trang đầy ý nghĩa về di sản văn hóa Việt Nam."
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onMakeNewspaper}
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              color: 'var(--text)',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(212,160,84,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            📰 Làm Tờ Báo
          </button>
          <button
            onClick={onReturn}
            style={{
              background: 'linear-gradient(135deg, var(--wood-dark), var(--wood))',
              color: '#fdf3e3',
              border: 'none',
              borderRadius: 12,
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(90,50,10,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            ← Quay về làng
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── App ─────────────────────────────────────────────────── */
export default function App({ initialNpcId = null, onExit, onComplete }) {
  const initialNPC = ALL_NPCS.find((npc) => npc.id === initialNpcId) || null
  const [scene, setScene] = useState(initialNPC ? 'interview' : 'village')   // 'village' | 'interview' | 'complete' | 'newspaper'
  const [currentNPC, setCurrentNPC] = useState(initialNPC)
  // Lịch sử chat của lần phỏng vấn vừa xong — giữ lại để NewspaperScene có
  // thêm nguồn đoạn trích thật ngoài `notebook.sections` (xem mục 4 trong
  // NEWSPAPER_FEATURE_IMPLEMENTATION.md).
  const [interviewMessages, setInterviewMessages] = useState([])

  const handleSelectNPC = (npc) => {
    setCurrentNPC(npc)
    setScene('interview')
  }

  const handleBack = () => {
    if (initialNPC && onExit) {
      onExit()
      return
    }
    setCurrentNPC(null)
    setScene('village')
  }

  const handleComplete = (npc, messages) => {
    setCurrentNPC(npc)
    setInterviewMessages(messages || [])
    setScene('complete')
  }

  const handleMakeNewspaper = () => {
    setScene('newspaper')
  }

  const handleFinishNewspaper = () => {
    onComplete?.(currentNPC)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {scene === 'village' && (
        <VillageScene
          npcs={ALL_NPCS}
          onSelectNPC={handleSelectNPC}
          onExit={onExit}
        />
      )}

      {scene === 'interview' && currentNPC && (
        <InterviewScene
          key={currentNPC.id}
          npcData={currentNPC}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}

      {scene === 'complete' && currentNPC && (
        <CompletionScreen
          npcData={currentNPC}
          onReturn={handleBack}
          onMakeNewspaper={handleMakeNewspaper}
        />
      )}

      {scene === 'newspaper' && currentNPC && (
        <NewspaperScene
          key={`np-${currentNPC.id}`}
          npcData={currentNPC}
          messages={interviewMessages}
          onBack={() => setScene('complete')}
          onFinish={handleFinishNewspaper}
        />
      )}
    </div>
  )
}
