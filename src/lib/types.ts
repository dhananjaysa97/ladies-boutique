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
export const AllProducts : ProductModes = 'all';
export const HotProducts : ProductModes = 'hot';
export const LatestProducts : ProductModes = 'latest';


export interface ProductGridProps {
  mode?: ProductModes; // optional, default to "all"
}