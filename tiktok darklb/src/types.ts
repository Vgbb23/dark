export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  images: string[];
  variations: {
    id: string;
    name: string;
    image: string;
  }[];
  shipping: {
    free: boolean;
    estimatedDelivery: string;
    fee: number;
    originalFee: number;
  };
  store: {
    name: string;
    logo: string;
    sales: string;
    responseTime: string;
    onTimeDelivery: string;
  };
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  images: string[];
  variation: string;
}
