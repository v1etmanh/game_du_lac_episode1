import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Circle,
  Ellipse,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
  Star,
  Text,
} from 'react-konva'
import type { JournalEntry } from '../data/journalEntries'

const photoAssets: Record<string, string> = {
  'dan-bau': new URL('../assets/journal/photos/dan-bau.png', import.meta.url).href,
  'o-an-quan': new URL('../assets/journal/photos/o-an-quan.png', import.meta.url).href,
  'cho-viet-nam': new URL('../assets/journal/photos/cho-viet-nam.png', import.meta.url).href,
  'den-lang': new URL('../assets/journal/photos/den-lang.png', import.meta.url).href,
  'hoi-lang': new URL('../assets/journal/photos/hoi-lang.png', import.meta.url).href,
  'mien-bac': new URL('../assets/journal/photos/mien-bac.png', import.meta.url).href,
}

const stickerAssets: Record<JournalEntry['sketch'], string> = {
  danBau: new URL('../assets/journal/paper/dan_bau.png', import.meta.url).href,
  oAnQuan: new URL('../assets/journal/paper/o_an_quan.png', import.meta.url).href,
  market: new URL('../assets/journal/paper/gio.png', import.meta.url).href,
  temple: new URL('../assets/journal/paper/dinh_lang.png', import.meta.url).href,
  festival: new URL('../assets/journal/paper/trong.png', import.meta.url).href,
  northernLife: new URL('../assets/journal/paper/rice.png', import.meta.url).href,
}

type TravelJournalCanvasProps = {
  entries: JournalEntry[]
  unlockedIds: Set<string>
  activeId: string
  currentSpread: number
  onSelectEntry: (id: string) => void
}

const BASE_WIDTH = 1180
const BASE_HEIGHT = 620
const PAGE_WIDTH = 560
const PAGE_HEIGHT = 540
const PAGE_TOP = 42
const LEFT_PAGE_X = 30
const RIGHT_PAGE_X = 590

function useCanvasSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const updateWidth = () => {
      setWidth(Math.max(320, Math.min(BASE_WIDTH, node.clientWidth)))
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, width, height: Math.round((width / BASE_WIDTH) * BASE_HEIGHT) }
}

function useAssetImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const nextImage = new Image()
    nextImage.src = src
    nextImage.onload = () => setImage(nextImage)
    return () => {
      nextImage.onload = null
    }
  }, [src])

  return image
}

function coverCrop(image: HTMLImageElement, targetWidth: number, targetHeight: number) {
  const imageRatio = image.width / image.height
  const targetRatio = targetWidth / targetHeight

  if (imageRatio > targetRatio) {
    const cropWidth = image.height * targetRatio
    return {
      cropX: (image.width - cropWidth) / 2,
      cropY: 0,
      cropWidth,
      cropHeight: image.height,
    }
  }

  const cropHeight = image.width / targetRatio
  return {
    cropX: 0,
    cropY: (image.height - cropHeight) / 2,
    cropWidth: image.width,
    cropHeight,
  }
}

function containSize(image: HTMLImageElement, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height)
  return {
    width: image.width * scale,
    height: image.height * scale,
  }
}

function pageX(page: number) {
  return page % 2 === 0 ? LEFT_PAGE_X : RIGHT_PAGE_X
}

function paperDots(page: number) {
  return Array.from({ length: 34 }, (_, index) => {
    const seed = (index + 1) * (page + 5)
    return {
      x: 24 + ((seed * 47) % (PAGE_WIDTH - 48)),
      y: 24 + ((seed * 31) % (PAGE_HEIGHT - 48)),
      r: 0.8 + (seed % 3) * 0.35,
      opacity: 0.08 + (seed % 4) * 0.025,
    }
  })
}

function textLines(notes: string[]) {
  return notes.join('\n')
}

function Tape({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) {
  return (
    <Rect
      x={x}
      y={y}
      width={78}
      height={22}
      fill="rgba(246, 224, 161, 0.72)"
      stroke="rgba(115, 94, 45, 0.2)"
      strokeWidth={1}
      rotation={rotation}
      cornerRadius={2}
    />
  )
}

function UnlockedPage({
  entry,
  isActive,
  onSelectEntry,
}: {
  entry: JournalEntry
  isActive: boolean
  onSelectEntry: (id: string) => void
}) {
  const photoImage = useAssetImage(photoAssets[entry.id])
  const stickerImage = useAssetImage(stickerAssets[entry.sketch])
  const photoX = 42
  const noteX = 284
  const titleX = 44
  const stickerSize = stickerImage ? containSize(stickerImage, 96, 74) : null
  const photoCrop = photoImage ? coverCrop(photoImage, 182, 126) : null

  return (
    <Group onClick={() => onSelectEntry(entry.id)} onTap={() => onSelectEntry(entry.id)}>
      {isActive ? (
        <Rect x={18} y={18} width={PAGE_WIDTH - 36} height={PAGE_HEIGHT - 36} stroke={entry.accent} strokeWidth={3} dash={[12, 10]} cornerRadius={10} />
      ) : null}
      <Text x={titleX} y={34} width={430} text={entry.title} fill="#2f2820" fontFamily="Georgia, serif" fontSize={35} fontStyle="bold" />
      <Text x={titleX + 4} y={76} width={430} text={`${entry.stamp} - ${entry.location}`} fill={entry.accent} fontFamily="Segoe UI, sans-serif" fontSize={15} />

      <Group x={photoX} y={118} rotation={-4} draggable>
        <Rect width={210} height={188} fill="#fff7e7" stroke="#ddd0b8" strokeWidth={2} shadowColor="#3c2d21" shadowOpacity={0.18} shadowBlur={12} shadowOffset={{ x: 0, y: 8 }} cornerRadius={4} />
        <Rect x={14} y={14} width={182} height={126} fill={entry.imageTone} stroke="#f8f0de" strokeWidth={6} />
        {photoImage && photoCrop ? (
          <KonvaImage
            x={14}
            y={14}
            width={182}
            height={126}
            image={photoImage}
            cropX={photoCrop.cropX}
            cropY={photoCrop.cropY}
            cropWidth={photoCrop.cropWidth}
            cropHeight={photoCrop.cropHeight}
          />
        ) : null}
        <Text x={18} y={152} width={174} text={entry.shortTitle} fill="#4c4036" fontFamily="Georgia, serif" fontSize={22} fontStyle="bold" align="center" />
      </Group>
      <Tape x={photoX + 54} y={105} rotation={-11} />

      <Group x={noteX} y={126} rotation={3} draggable>
        <Rect width={226} height={196} fill="#f8edcc" stroke="#e2d5ad" strokeWidth={2} shadowColor="#3c2d21" shadowOpacity={0.12} shadowBlur={10} shadowOffset={{ x: 0, y: 7 }} cornerRadius={4} />
        <Text x={18} y={18} width={188} text={`Gặp ${entry.npcName}`} fill="#5e4a35" fontFamily="Segoe Print, Comic Sans MS, cursive" fontSize={18} />
        <Text x={18} y={52} width={188} height={118} text={entry.summary} fill="#3f362f" fontFamily="Segoe Print, Comic Sans MS, cursive" fontSize={15} lineHeight={1.26} />
      </Group>
      <Tape x={noteX + 72} y={112} rotation={8} />

      {stickerImage && stickerSize ? (
        <Group x={384} y={266} rotation={7} draggable>
          <KonvaImage
            image={stickerImage}
            width={stickerSize.width}
            height={stickerSize.height}
            shadowColor="#2f241b"
            shadowOpacity={0.16}
            shadowBlur={10}
            shadowOffset={{ x: 0, y: 6 }}
          />
        </Group>
      ) : null}

      <Group x={52} y={352}>
        <Text x={0} y={0} width={456} text={textLines(entry.notes)} fill="#342f2a" fontFamily="Segoe Print, Comic Sans MS, cursive" fontSize={17} lineHeight={1.3} />
      </Group>
    </Group>
  )
}

function LockedPage({ page }: { page: number }) {
  return (
    <Group>
      <Text x={52} y={54} width={430} text={`Trang ${page + 1}`} fill="#9b8f80" fontFamily="Georgia, serif" fontSize={31} />
      <Rect x={72} y={136} width={188} height={136} fill="rgba(104, 94, 82, 0.04)" stroke="#d5cabb" strokeWidth={2} dash={[8, 8]} cornerRadius={7} />
      <Rect x={296} y={126} width={172} height={210} fill="rgba(104, 94, 82, 0.04)" stroke="#d5cabb" strokeWidth={2} dash={[8, 8]} cornerRadius={7} />
      <Line points={[72, 362, 438, 362, 72, 402, 382, 402, 72, 442, 326, 442]} stroke="#d5cabb" strokeWidth={4} lineCap="round" />
      <Text x={86} y={284} width={360} text="Chưa có ghi chú. Hãy gặp NPC hoặc hoàn thành thử thách để nhật kí tự điền vào đây." fill="#9b8f80" fontFamily="Segoe Print, Comic Sans MS, cursive" fontSize={19} lineHeight={1.35} />
    </Group>
  )
}

function PageBase({ page, children }: { page: number; children: ReactNode }) {
  const dots = useMemo(() => paperDots(page), [page])
  const isLeft = page % 2 === 0

  return (
    <Group x={pageX(page)} y={PAGE_TOP}>
      <Rect
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        fill="#f3eee4"
        stroke="#d8d1c4"
        strokeWidth={2}
        cornerRadius={isLeft ? [12, 3, 3, 12] : [3, 12, 12, 3]}
        shadowColor="#20170f"
        shadowOpacity={0.18}
        shadowBlur={18}
        shadowOffset={{ x: isLeft ? -4 : 4, y: 8 }}
      />
      <Rect x={isLeft ? PAGE_WIDTH - 18 : 0} y={0} width={18} height={PAGE_HEIGHT} fill={isLeft ? 'rgba(78, 65, 47, 0.06)' : 'rgba(255, 255, 255, 0.22)'} />
      {dots.map((dot, index) => (
        <Circle key={index} x={dot.x} y={dot.y} radius={dot.r} fill="#352a20" opacity={dot.opacity} />
      ))}
      {children}
    </Group>
  )
}

function ScrapbookDecorations() {
  return (
    <Group>
      <Rect x={0} y={0} width={BASE_WIDTH} height={BASE_HEIGHT} fill="#17181d" />
      <Rect x={12} y={88} width={24} height={440} fill="#76344b" opacity={0.86} />
      <Rect x={1144} y={88} width={24} height={440} fill="#76344b" opacity={0.86} />
      <Rect x={34} y={32} width={1112} height={552} fill="#4a3340" cornerRadius={10} />
      <Line points={[590, 42, 590, 582]} stroke="#b6aea2" strokeWidth={3} shadowColor="#1b130d" shadowBlur={18} shadowOpacity={0.42} />
      <Ellipse x={590} y={584} radiusX={58} radiusY={12} fill="rgba(255,255,255,0.09)" />
      <Text x={60} y={10} width={310} text="NHẬT KÍ DU LẠC" fill="#f7efe5" fontFamily="Georgia, serif" fontSize={25} fontStyle="bold" />
      <Text x={880} y={12} width={240} text="CLICK ĐỂ GHI CHÚ" fill="#c9bca8" fontFamily="Segoe UI, sans-serif" fontSize={17} align="right" />
      <Star x={372} y={24} numPoints={5} innerRadius={6} outerRadius={12} fill="#e1bc51" rotation={18} />
    </Group>
  )
}

export function TravelJournalCanvas({
  entries,
  unlockedIds,
  activeId,
  currentSpread,
  onSelectEntry,
}: TravelJournalCanvasProps) {
  const { ref, width, height } = useCanvasSize()
  const visiblePages = [currentSpread, currentSpread + 1]

  return (
    <div ref={ref} className="journal-canvas-shell" aria-label="Canvas nhật kí du lạc">
      <Stage width={width} height={height} scaleX={width / BASE_WIDTH} scaleY={height / BASE_HEIGHT}>
        <Layer>
          <ScrapbookDecorations />
          {visiblePages.map((page) => {
            const entry = entries.find((item) => item.page === page)
            const unlocked = entry ? unlockedIds.has(entry.id) : false

            return (
              <PageBase key={page} page={page}>
                {entry && unlocked ? (
                  <UnlockedPage entry={entry} isActive={entry.id === activeId} onSelectEntry={onSelectEntry} />
                ) : (
                  <LockedPage page={page} />
                )}
              </PageBase>
            )
          })}
        </Layer>
      </Stage>
    </div>
  )
}
