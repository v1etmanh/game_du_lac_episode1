export type AssetKey =
  | "cloud"
  | "farMountain"
  | "nearMountain"
  | "ground"
  | "grassTuft"
  | "tree"
  | "rock"
  | "rollingRock"
  | "rollingRockBig"
  | "windmillTower"
  | "windmillFan"
  | "powerline"
  | "bambooPole"
  | "lowBranch"
  | "hayStack"
  | "woodenCart"
  | "lowPowerline"
  | "stormGust"
  | "windGust"
  | "kiteBody"
  | "kiteTail"
  | "character"
  | "bird";

const MANIFEST: Record<AssetKey, string> = {
  cloud: "/tha_dieu/cloud.png",
  farMountain: "/tha_dieu/far_mountain.png",
  nearMountain: "/tha_dieu/nearest_moutain.png",
  ground: "/tha_dieu/ground.png",
  grassTuft: "/tha_dieu/raw.png",
  tree: "/tha_dieu/tree.png",
  rock: "/tha_dieu/stone.png",
  rollingRock: "/tha_dieu/move_stone.png",
  rollingRockBig: "/tha_dieu/bigger_move_stone.png",
  windmillTower: "/tha_dieu/coixoaygio.png",
  windmillFan: "/tha_dieu/fan.png",
  powerline: "/tha_dieu/chuongngaivat.png",
  bambooPole: "/tha_dieu/obstacles/bamboo_pole.png",
  lowBranch: "/tha_dieu/obstacles/low_branch.png",
  hayStack: "/tha_dieu/obstacles/hay_stack.png",
  woodenCart: "/tha_dieu/obstacles/wooden_cart.png",
  lowPowerline: "/tha_dieu/obstacles/low_powerline.png",
  stormGust: "/tha_dieu/obstacles/storm_gust.png",
  windGust: "/tha_dieu/gio.png",
  kiteBody: "/tha_dieu/dieu.png",
  kiteTail: "/tha_dieu/day_dieu.png",
  character: "/tha_dieu/nha_vat.png",
  bird: "/tha_dieu/chim.png",
};

class AssetLoaderImpl {
  private readonly images = new Map<AssetKey, HTMLImageElement>();
  private readonly loaded = new Set<AssetKey>();
  private readonly topTrim = new Map<AssetKey, number>();

  constructor() {
    (Object.keys(MANIFEST) as AssetKey[]).forEach((key) => {
      const image = new Image();
      image.onload = () => {
        this.loaded.add(key);
        this.analyzeTopPadding(key, image);
      };
      image.src = MANIFEST[key];
      this.images.set(key, image);
    });
  }

  private analyzeTopPadding(key: AssetKey, image: HTMLImageElement): void {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.drawImage(image, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sampleXs = [0.1, 0.3, 0.5, 0.7, 0.9].map((fraction) => Math.floor(width * fraction));
      let firstOpaqueRow = 0;

      rowScan:
      for (let y = 0; y < height; y += 1) {
        for (const x of sampleXs) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const isBlankPixel = alpha < 20 || (r > 242 && g > 242 && b > 242);
          if (!isBlankPixel) {
            firstOpaqueRow = y;
            break rowScan;
          }
        }
      }

      this.topTrim.set(key, firstOpaqueRow / height);
    } catch {
      // Canvas may be unreadable in some environments; skip trimming silently.
    }
  }

  get(key: AssetKey): HTMLImageElement | null {
    if (!this.loaded.has(key)) {
      return null;
    }
    return this.images.get(key) ?? null;
  }

  getTopTrim(key: AssetKey): number {
    return this.topTrim.get(key) ?? 0;
  }
}

export const AssetLoader = new AssetLoaderImpl();
