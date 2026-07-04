import PhongSuApp from '../../phong_su/src/App.jsx'
import '../../phong_su/src/index.css'
import './PhongSuGame.css'

export default function PhongSuGame({ npcId, onExit, onComplete }) {
  return (
    <div className="phong-su-game">
      <PhongSuApp initialNpcId={npcId} onExit={onExit} onComplete={onComplete} />
    </div>
  )
}
