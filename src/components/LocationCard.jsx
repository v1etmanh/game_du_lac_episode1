import './LocationCard.css'

export default function LocationCard({ location, isSelected, isShaking, onClick }) {
  const locked = !location.unlocked

  return (
    <div
      className={[
        'loc-card',
        isSelected ? 'selected' : '',
        locked ? 'locked' : '',
        isShaking ? 'shaking' : '',
      ].join(' ').trim()}
      onClick={() => onClick(location)}
    >
      {isSelected && <div className="loc-card-chevron">▾</div>}

      <div
        className="loc-card-image"
        style={{ backgroundImage: `url(${location.image})` }}
      />

      <div className="loc-card-body">
        <h3 className="loc-card-name">{location.name}</h3>
        <p className="loc-card-desc">{location.description}</p>
        {location.completed && <div className="loc-card-stars">★ Hoàn thành</div>}
        {locked && <div className="loc-card-lock">🔒</div>}
      </div>
    </div>
  )
}
