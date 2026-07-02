import { useState } from 'react'
import './IntroSequence.css'

const VIDEOS = ['/video/video1.mp4', '/video/video2.mp4', '/video/video3.mp4']

// Trình tự intro: video1 chạy hết (không loop) -> chờ click -> video2 -> chờ click -> video3 -> chờ click -> chữ "Du Lạc - Episode 1"
export default function IntroSequence({ onFinish }) {
  const [videoIndex, setVideoIndex] = useState(0)
  const [stage, setStage] = useState('video') // 'video' | 'title'
  const [ended, setEnded] = useState(false) // video hiện tại đã chiếu xong chưa

  const handleClick = () => {
    if (stage !== 'video' || !ended) return // đang chiếu dở thì click không có tác dụng

    if (videoIndex < VIDEOS.length - 1) {
      setEnded(false)
      setVideoIndex((i) => i + 1)
    } else {
      setStage('title')
    }
  }

  return (
    <div className="intro-root" onClick={handleClick}>
      {stage === 'video' && (
        <video
          key={videoIndex}
          className="intro-video"
          src={VIDEOS[videoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={() => setEnded(true)}
        />
      )}

      {stage === 'title' && (
        <div className="intro-title-screen" onClick={onFinish}>
          <p className="intro-title-sub">Du Lạc Diary</p>
          <h1 className="intro-title-main">EPISODE 1</h1>
          <p className="intro-title-hint">Nhấn để bắt đầu</p>
        </div>
      )}

      {stage === 'video' && (
        <div className="intro-progress">
          {VIDEOS.map((_, i) => (
            <span
              key={i}
              className={`intro-dot ${i === videoIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}

      {stage === 'video' && ended && (
        <div className="intro-click-hint">Nhấn màn hình để tiếp tục</div>
      )}
    </div>
  )
}
