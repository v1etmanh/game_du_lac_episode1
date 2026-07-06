import GiaiDoGame from '../giai_do/GiaiDoGame.jsx'

export default function NhaCuQuest({ onExit }) {
  return (
    <GiaiDoGame
      onBack={onExit}
      onComplete={onExit}
    />
  )
}
