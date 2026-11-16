export type Language = 'uz' | 'ru';

export interface Category {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  descriptionUz: string;
  descriptionRu: string;
  icon: string;
  sortOrder: number;
}

export interface ProductSpec {
  labelUz: string;
  labelRu: string;
  valueUz: string;
  valueRu: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  categoryId: string;
  nameUz: string;
  nameRu: string;
  descriptionUz: string;
  descriptionRu: string;
  unitPrice: number;
  oldUnitPrice?: number;
  packPrice: number;
  packQuantity: number;
  unitNameUz: string;
  unitNameRu: string;
  packTypeUz: string;
  packTypeRu: string;
  inStock: boolean;
  stockPacks: number;
  lowStockThreshold: number;
  isNew: boolean;
  isFeatured: boolean;
  isSpecialOffer: boolean;
  images: string[];
  specs: ProductSpec[];
  updatedAt: string;
}

export interface SiteSettings {
  companyNameUz: string;
  companyNameRu: string;
  logoUrl?: string;
  subtitleUz: string;
  subtitleRu: string;
  phonePrimary: string;
  phoneSecondary: string;
  telegramUsername: string;
  telegramChannel: string;
  addressUz: string;
  addressRu: string;
  workingHoursUz: string;
  workingHoursRu: string;
  minOrderNoteUz: string;
  minOrderNoteRu: string;
  adminPin: string;
}

export interface CatalogData {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
}

