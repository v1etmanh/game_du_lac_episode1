import { useEffect, useRef } from 'react'

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bubble: (sender) => ({
    maxWidth: '78%',
    alignSelf: sender === 'player' ? 'flex-end' : 'flex-start',
    background: sender === 'player'
      ? 'linear-gradient(135deg, #8b5e3c, #a0714f)'
      : 'linear-gradient(135deg, #fff8ee, #fdf0dc)',
    color: sender === 'player' ? '#fff8ee' : '#3d1f0a',
    padding: '10px 14px',
    borderRadius: sender === 'player' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    boxShadow: '0 2px 8px rgba(90,50,10,0.18)',
    fontSize: '0.93rem',
    lineHeight: '1.55',
    fontFamily: 'var(--font)',
    wordBreak: 'break-word',
    animation: 'fadeInBubble 0.3s ease',
  }),
  senderLabel: (sender) => ({
    fontSize: '0.72rem',
    fontWeight: 600,
    color: sender === 'player' ? 'rgba(255,248,238,0.7)' : 'var(--text-light)',
    marginBottom: '3px',
  }),
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },
  metaChip: {
    fontSize: '0.68rem',
    fontWeight: 700,
    borderRadius: 999,
    padding: '2px 7px',
    background: 'rgba(92,61,30,0.12)',
    color: '#6f4424',
  },
  typingDots: {
    alignSelf: 'flex-start',
    background: 'linear-gradient(135deg, #fff8ee, #fdf0dc)',
    padding: '10px 16px',
    borderRadius: '18px 18px 18px 4px',
    boxShadow: '0 2px 8px rgba(90,50,10,0.18)',
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    animation: 'fadeInBubble 0.3s ease',
  },
  dot: (delay) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--wood-light)',
    animation: `dotBounce 1.2s ease-in-out ${delay}s infinite`,
  }),
}

export default function MessageList({ messages, isTyping, npcName }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <>
      <style>{`
        @keyframes fadeInBubble {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
      <div style={styles.container}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'player' ? 'flex-end' : 'flex-start' }}>
            <div style={styles.senderLabel(msg.sender)}>
              {msg.sender === 'player' ? 'Bạn' : npcName}
            </div>
            <div style={styles.bubble(msg.sender)}>
              {msg.text}
              {msg.meta && (
                <div style={styles.metaRow}>
                  {msg.meta.questionType && (
                    <span style={styles.metaChip}>{msg.meta.questionType}</span>
                  )}
                  {typeof msg.meta.score === 'number' && (
                    <span style={styles.metaChip}>điểm {msg.meta.score}</span>
                  )}
                  {(msg.meta.tags || []).map(tag => (
                    <span key={tag} style={styles.metaChip}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={styles.senderLabel('npc')}>{npcName}</div>
            <div style={styles.typingDots}>
              <div style={styles.dot(0)} />
              <div style={styles.dot(0.2)} />
              <div style={styles.dot(0.4)} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </>
  )
}
