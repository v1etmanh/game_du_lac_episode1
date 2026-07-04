import { useState } from 'react'
import GiaiDoGame from '../giai_do/GiaiDoGame.jsx'
import HaiQuaGame from '../hai_qua/HaiQuaGame.jsx'

export default function NhaCuQuest({ onExit }) {
  const [phase, setPhase] = useState('giai-do')

  if (phase === 'hai-qua') {
    return <HaiQuaGame onExit={onExit} />
  }

  return (
    <GiaiDoGame
      onBack={onExit}
      onComplete={() => setPhase('hai-qua')}
    />
  )
}
