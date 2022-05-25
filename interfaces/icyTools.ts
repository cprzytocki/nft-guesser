export interface Collection {
  node: {
    address: string;
    name: string;
    stats: {
      totalSales: number;
      average: number;
      ceiling: number;
      floor: number;
      volume: number;
    };
    unsafeOpenseaImageUrl: string;
    symbol: string;
  };
}

export interface CollectionResponse {
  data: {
    contracts: {
      edges: Collection[];
    };
  };
}
