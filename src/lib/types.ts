export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type ProductOperationModes = 'create' | 'update' | 'delete' | 'saved';
export const CreateProduct : ProductOperationModes = 'create';
export const UpdateProduct : ProductOperationModes = 'update';
export const DeleteProduct : ProductOperationModes = 'delete';
export const SavedProduct : ProductOperationModes = 'saved';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  gallery?:string[];
  images?:string[];
  imageUrl: string;
  category: string;
  sizes: Size[];
  color?: string;
  isHot?: boolean;
  isLatest?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  operationMode: ProductOperationModes
}

export interface ProductsStatus {
  loading: boolean;
  error: string | null;
}

export interface ProductsOperations {
  refreshProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
}

export type ProductModes = 'all' | 'hot' | 'latest';
export const AllProductsMode : ProductModes = 'all';
export const HotProductsMode : ProductModes = 'hot';
export const LatestProductsMode : ProductModes = 'latest';


export interface ProductGridProps {
  mode?: ProductModes; // optional, default to "all"
  title: string
}

export const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

export type ColorFilter =
  | 'Black'
  | 'White'
  | 'Beige'
  | 'Blue'
  | 'Pink'
  | 'Red'
  | 'Green';

  export const ALL_COLORS: ColorFilter[] = [
    'Black',
    'White',
    'Beige',
    'Blue',
    'Pink',
    'Red',
    'Green',
  ];


export interface ProductFilterState {
  mode: ProductModes;
  searchTerm: string;
  sizes: Size[];
  colors: ColorFilter[];
  minPrice?: number;
  maxPrice?: number;
}

export const defaultProductFilterState: ProductFilterState = {
  mode:AllProductsMode,
  searchTerm: '',
  sizes: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
};

export interface ProductsContextValue {
  allProducts: Product[];
  hotProducts: Product[];
  latestProducts: Product[];
  productsMap: Record<string, Product>;
  productStatus: ProductsStatus;

  filters: ProductFilterState,
  setFilters: (f: ProductFilterState) => void;
  filteredProducts: Product[];

  createProduct: (p: Product) => Promise<void>;
  upsertProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

