import { create } from 'zustand';

export type PrintPositionKey = 'front' | 'back' | 'left_pocket' | 'right_pocket' | 'left_sleeve';
export type StudioStep = 'category' | 'product' | 'editor' | 'sizing' | 'review';

export interface TransformState {
  scale: number;
  xOffset: number;
  yOffset: number;
  rotation: number;
  isFlippedH: boolean;
}

export type DesignStateTransforms = Record<PrintPositionKey, TransformState>;
export type DesignArtworks = Partial<Record<PrintPositionKey, string>>;
export type DesignDpiStatuses = Partial<Record<PrintPositionKey, { dpi: number; label: string; color: string }>>;

export interface StudioConfig {
  productSku: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productDescription?: string;
  productGsm?: string;
  productBaseColor?: string;
  selectedSize: string;
  selectedColor: string;
  finishOption: 'standard' | 'hd' | 'vintage';
}

interface SnapshotState {
  artworks: DesignArtworks;
  transforms: DesignStateTransforms;
}

const DEFAULT_TRANSFORM: TransformState = {
  scale: 100,
  xOffset: 0,
  yOffset: 0,
  rotation: 0,
  isFlippedH: false,
};

const DEFAULT_TRANSFORMS_MAP: DesignStateTransforms = {
  front: { ...DEFAULT_TRANSFORM },
  back: { ...DEFAULT_TRANSFORM },
  left_pocket: { ...DEFAULT_TRANSFORM },
  right_pocket: { ...DEFAULT_TRANSFORM },
  left_sleeve: { ...DEFAULT_TRANSFORM },
};

interface DesignStudioStore {
  step: StudioStep;
  activeCategory: string;
  activeTab: PrintPositionKey;
  artworks: DesignArtworks;
  transforms: DesignStateTransforms;
  dpiStatuses: DesignDpiStatuses;
  config: StudioConfig;
  
  // History Stack
  history: SnapshotState[];
  historyIndex: number;

  // Actions
  setStep: (step: StudioStep) => void;
  setActiveCategory: (cat: string) => void;
  setActiveTab: (tab: PrintPositionKey) => void;
  setArtwork: (position: PrintPositionKey, url: string | undefined) => void;
  setDpiStatus: (position: PrintPositionKey, status: { dpi: number; label: string; color: string } | undefined) => void;
  updateTransform: (position: PrintPositionKey, partial: Partial<TransformState>) => void;
  resetTransform: (position: PrintPositionKey) => void;
  centerTransform: (position: PrintPositionKey, axis?: 'x' | 'y' | 'both') => void;
  
  // Config Actions
  setConfig: (partial: Partial<StudioConfig>) => void;

  // History Actions
  pushHistoryState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  resetStudio: () => void;
}

export const useDesignStudioStore = create<DesignStudioStore>((set, get) => ({
  step: 'category',
  activeCategory: 'tshirts',
  activeTab: 'front',
  artworks: {},
  transforms: JSON.parse(JSON.stringify(DEFAULT_TRANSFORMS_MAP)),
  dpiStatuses: {},
  config: {
    productSku: 'TSHIRT-OVERSIZED-BLK',
    productName: 'Heavyweight Oversized Tee',
    productPrice: 799,
    productCategory: 'T-Shirts',
    productDescription: '240 GSM 100% Super-Combed French Terry Cotton with relaxed drop shoulders.',
    productGsm: '240 GSM',
    productBaseColor: '#18181B',
    selectedSize: 'M',
    selectedColor: 'Black',
    finishOption: 'standard',
  },
  history: [{ artworks: {}, transforms: JSON.parse(JSON.stringify(DEFAULT_TRANSFORMS_MAP)) }],
  historyIndex: 0,

  setStep: (step) => set({ step }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setActiveTab: (activeTab) => set({ activeTab }),

  setArtwork: (position, url) => {
    set((state) => {
      const nextArtworks = { ...state.artworks };
      if (url) {
        nextArtworks[position] = url;
      } else {
        delete nextArtworks[position];
      }
      return { artworks: nextArtworks };
    });
    get().pushHistoryState();
  },

  setDpiStatus: (position, status) => {
    set((state) => {
      const nextDpi = { ...state.dpiStatuses };
      if (status) {
        nextDpi[position] = status;
      } else {
        delete nextDpi[position];
      }
      return { dpiStatuses: nextDpi };
    });
  },

  updateTransform: (position, partial) => {
    set((state) => {
      const nextTransforms = {
        ...state.transforms,
        [position]: {
          ...state.transforms[position],
          ...partial,
        },
      };
      return { transforms: nextTransforms };
    });
  },

  resetTransform: (position) => {
    set((state) => ({
      transforms: {
        ...state.transforms,
        [position]: { ...DEFAULT_TRANSFORM },
      },
    }));
    get().pushHistoryState();
  },

  centerTransform: (position, axis = 'both') => {
    set((state) => {
      const current = state.transforms[position];
      return {
        transforms: {
          ...state.transforms,
          [position]: {
            ...current,
            xOffset: axis === 'y' ? current.xOffset : 0,
            yOffset: axis === 'x' ? current.yOffset : 0,
          },
        },
      };
    });
    get().pushHistoryState();
  },

  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  pushHistoryState: () => {
    const { artworks, transforms, history, historyIndex } = get();
    const snapshot: SnapshotState = {
      artworks: JSON.parse(JSON.stringify(artworks)),
      transforms: JSON.parse(JSON.stringify(transforms)),
    };

    // Trim future history if we pushed a state after undoing
    const sliced = history.slice(0, historyIndex + 1);
    set({
      history: [...sliced, snapshot],
      historyIndex: sliced.length,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevSnapshot = history[prevIndex];
      if (prevSnapshot) {
        set({
          historyIndex: prevIndex,
          artworks: JSON.parse(JSON.stringify(prevSnapshot.artworks)),
          transforms: JSON.parse(JSON.stringify(prevSnapshot.transforms)),
        });
      }
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextSnapshot = history[nextIndex];
      if (nextSnapshot) {
        set({
          historyIndex: nextIndex,
          artworks: JSON.parse(JSON.stringify(nextSnapshot.artworks)),
          transforms: JSON.parse(JSON.stringify(nextSnapshot.transforms)),
        });
      }
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  resetStudio: () => {
    set({
      step: 'category',
      activeCategory: 'tshirts',
      activeTab: 'front',
      artworks: {},
      transforms: JSON.parse(JSON.stringify(DEFAULT_TRANSFORMS_MAP)),
      dpiStatuses: {},
      history: [{ artworks: {}, transforms: JSON.parse(JSON.stringify(DEFAULT_TRANSFORMS_MAP)) }],
      historyIndex: 0,
    });
  },
}));
