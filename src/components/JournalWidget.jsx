import { useMemo, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import { TravelJournalCanvas } from '../nhat_ki/src/components/TravelJournalCanvas.tsx'
import { journalEntries } from '../nhat_ki/src/data/journalEntries.ts'
import '../nhat_ki/src/App.css'
import './JournalWidget.css'

// Widget "sổ nhật kí" đặt ở góc phải màn hình.
// - Thu gọn: 1 nút tròn hình cuốn sổ + badge tiến độ (vd 2/6).
// - Mở rộng: overlay hiển thị lại UI nhật kí gốc (từ demo nhat_ki), thu nhỏ vừa modal.
//
// TODO tích hợp gameplay thật: hiện tại unlockEntry() chỉ được gọi từ panel
// "Sự kiện mở khóa" (giả lập) bên trong widget. Để tự mở khóa khi người chơi
// gặp NPC / xong hội thoại thật, cần quyết định ánh xạ giữa id trong
// journalEntries.ts (dan-bau, o-an-quan, cho-viet-nam, den-lang, hoi-lang,
// mien-bac) và id địa điểm/hội thoại thật trong src/data/locations.js,
// src/dialog/*.json (ao_lang, cho, chua, cong_lang, den_lang, gieng_lang,
// nha_ba_ngan, nha_ba_tu, nha_hung, nha_minh, ruong, vuon_cay) - hai bộ id
// này hiện không khớp 1-1 nên chưa tự nối được, cần làm ở bước sau.
export default function JournalWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [unlockedIds, setUnlockedIds] = useState(() => new Set())
  const [activeId, setActiveId] = useState(journalEntries[0].id)
  const [currentSpread, setCurrentSpread] = useState(0)

  const activeEntry = useMemo(
    () => journalEntries.find((entry) => entry.id === activeId) ?? journalEntries[0],
    [activeId],
  )

  const unlockedCount = unlockedIds.size
  const progress = Math.round((unlockedCount / journalEntries.length) * 100)

  const goToEntry = (id) => {
    const entry = journalEntries.find((item) => item.id === id)
    if (!entry) return
    setActiveId(id)
    setCurrentSpread(Math.floor(entry.page / 2) * 2)
  }

  const unlockEntry = (id) => {
    goToEntry(id)
    setUnlockedIds((current) => {
      const next = new Set(current)
      next.add(id)
      return next
    })
  }

  const resetJournal = () => {
    setUnlockedIds(new Set())
    setActiveId(journalEntries[0].id)
    setCurrentSpread(0)
  }

  const revealAll = () => {
    setUnlockedIds(new Set(journalEntries.map((entry) => entry.id)))
  }

  const goPrevious = () => setCurrentSpread((page) => Math.max(0, page - 2))
  const goNext = () =>
    setCurrentSpread((page) => Math.min(journalEntries.length - 2, page + 2))

  return (
    <>
      <button
        type="button"
        className="journal-fab"
        onClick={() => setIsOpen(true)}
        aria-label={`Mở nhật kí - đã khám phá ${unlockedCount} trên ${journalEntries.length} trang`}
      >
        <BookOpen size={22} aria-hidden="true" />
        <span className="journal-fab-badge">
          {unlockedCount}/{journalEntries.length}
        </span>
      </button>

      {isOpen ? (
        <div className="journal-overlay" role="dialog" aria-modal="true" aria-label="Nhật kí du lạc">
          <div className="journal-overlay-backdrop" onClick={() => setIsOpen(false)} />

          <div className="journal-modal">
            <button
              type="button"
              className="journal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng nhật kí"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <section className="journal-workspace" aria-label="Không gian nhật kí">
              <div className="topbar">
                <div className="brand-mark">
                  <BookOpen size={24} aria-hidden="true" />
                  <div>
                    <h1>Nhật kí du lạc</h1>
                    <p>Ghi lại những gì bạn đã khám phá trong hành trình.</p>
                  </div>
                </div>

                <div
                  className="progress-chip"
                  aria-label={`Đã mở ${unlockedCount} trên ${journalEntries.length} trang`}
                >
                  <span>{progress}%</span>
                  <div className="progress-track">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="content-grid">
                <aside className="event-panel" aria-label="Sự kiện giả lập">
                  <div className="panel-heading">
                    <Sparkles size={20} aria-hidden="true" />
                    <div>
                      <h2>Sự kiện mở khóa</h2>
                      <p>Bấm để giả lập việc vừa khám phá kiến thức (tạm thời, chờ nối vào gameplay thật).</p>
                    </div>
                  </div>

                  <div className="event-list">
                    {journalEntries.map((entry) => {
                      const unlocked = unlockedIds.has(entry.id)
                      const selected = entry.id === activeId
                      const Icon = entry.type === 'challenge' ? Trophy : MessageCircle

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          className={`event-button ${selected ? 'is-selected' : ''}`}
                          onClick={() => unlockEntry(entry.id)}
                        >
                          <span className="event-icon">
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          <span className="event-copy">
                            <strong>{entry.triggerLabel}</strong>
                            <small>{entry.npcName} - {entry.location}</small>
                          </span>
                          {unlocked ? (
                            <CheckCircle2 className="event-state" size={18} aria-label="Đã mở khóa" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  <div className="panel-actions">
                    <button type="button" className="icon-button" onClick={revealAll} aria-label="Mở tất cả trang">
                      <CheckCircle2 size={19} aria-hidden="true" />
                    </button>
                    <button type="button" className="icon-button" onClick={resetJournal} aria-label="Làm trống nhật kí">
                      <RotateCcw size={19} aria-hidden="true" />
                    </button>
                  </div>
                </aside>

                <section className="book-panel" aria-label="Quyển nhật kí canvas">
                  <TravelJournalCanvas
                    entries={journalEntries}
                    unlockedIds={unlockedIds}
                    activeId={activeId}
                    currentSpread={currentSpread}
                    onSelectEntry={goToEntry}
                  />

                  <div className="book-controls">
                    <button type="button" className="nav-button" onClick={goPrevious} disabled={currentSpread === 0}>
                      <ChevronLeft size={20} aria-hidden="true" />
                      Trang trước
                    </button>
                    <span>Trang {currentSpread + 1}-{currentSpread + 2}</span>
                    <button
                      type="button"
                      className="nav-button"
                      onClick={goNext}
                      disabled={currentSpread >= journalEntries.length - 2}
                    >
                      Trang sau
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                  </div>
                </section>

                <aside className="detail-panel" aria-label="Thông tin trang đang chọn">
                  <span className="detail-tag">{activeEntry.type === 'challenge' ? 'Thử thách' : 'NPC'}</span>
                  <h2>{activeEntry.title}</h2>
                  <p>{activeEntry.summary}</p>
                  <dl>
                    <div>
                      <dt>Người kể</dt>
                      <dd>{activeEntry.npcName}</dd>
                    </div>
                    <div>
                      <dt>Địa điểm</dt>
                      <dd>{activeEntry.location}</dd>
                    </div>
                    <div>
                      <dt>Trạng thái</dt>
                      <dd>{unlockedIds.has(activeEntry.id) ? 'Đã ghi vào nhật kí' : 'Đang chờ khám phá'}</dd>
                    </div>
                  </dl>
                </aside>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  )
}
