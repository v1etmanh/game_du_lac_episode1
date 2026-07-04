import diaryImage from '../../public/diary.png'
import baNam from '../../public/ba_nam.png'
import baNam1 from '../../public/ba_nam_1.png'
import baNam2 from '../../public/ba_nam_2.png'
import baNam3 from '../../public/ba_nam_3.png'
import baNam4 from '../../public/ba_nam_4.png'
import baNam5 from '../../public/ba_nam_5.png'
import hung from '../../public/hung.png'
import hung1 from '../../public/hung_1.png'
import hung2 from '../../public/hung_2.png'
import hung3 from '../../public/hung_3.png'
import hung4 from '../../public/hung_4.png'
import hung5 from '../../public/hung_5.png'
import ongTu from '../../public/ong_tu.png'
import ongTu1 from '../../public/ong_tu_1.png'
import ongTu2 from '../../public/ong_tu_2.png'
import ongTu3 from '../../public/ong_tu_3.png'
import ongTu4 from '../../public/ong_tu_4.png'
import ongTu5 from '../../public/ong_tu_5.png'

export const CHARACTER_IMAGES = {
  ba_nam: baNam,
  ong_ba: ongTu,
  hung,
}

export const SECTION_BACKGROUNDS = {
  ba_nam: {
    origin: baNam1,
    structure: baNam4,
    playing: baNam5,
    sound: baNam3,
    memories: baNam2,
  },
  ong_ba: {
    origin: ongTu3,
    rules: ongTu4,
    materials: ongTu2,
    meaning: ongTu5,
    memories: ongTu1,
  },
  hung: {
    origin: hung1,
    selection: hung2,
    treatment: hung3,
    carving: hung4,
    memories: hung5,
  },
}

export const DIARY_IMAGE = diaryImage

export function getBackgroundSrc(portraitId, sectionId) {
  const map = SECTION_BACKGROUNDS[portraitId]
  if (!map) return null
  return map[sectionId] || Object.values(map)[0] || null
}

export function getAllBackgrounds(portraitId) {
  return Object.values(SECTION_BACKGROUNDS[portraitId] || {})
}
