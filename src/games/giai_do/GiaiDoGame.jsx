import EscapeRoomApp from '../../giai_do/src/App.js'
import './GiaiDoGame.css'

export default function GiaiDoGame({ onBack, onComplete }) {
  return (
    <div className="giai-do-embed-wrap">
      <EscapeRoomApp startRoute="office" onExit={onBack} onComplete={onComplete} />
    </div>
  )
}
