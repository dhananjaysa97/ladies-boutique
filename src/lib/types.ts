export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: Size[];
  color?: string;
  isHot?: boolean;
  isLatest?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
