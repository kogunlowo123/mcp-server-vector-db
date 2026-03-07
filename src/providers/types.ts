export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
  values?: number[];
}

export interface CollectionInfo {
  name: string;
  dimension: number;
  count: number;
  metric?: string;
}

export interface CollectionStats {
  name: string;
  vectorCount: number;
  dimension: number;
  indexSize?: number;
  metric?: string;
  status?: string;
}

export interface VectorProvider {
  name: string;

  upsert(
    collection: string,
    vectors: VectorRecord[]
  ): Promise<{ upsertedCount: number }>;

  query(
    collection: string,
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>,
    includeMetadata?: boolean
  ): Promise<QueryResult[]>;

  deleteVectors(
    collection: string,
    ids: string[]
  ): Promise<{ deletedCount: number }>;

  listCollections(): Promise<CollectionInfo[]>;

  createCollection(
    name: string,
    dimension: number,
    metric?: string
  ): Promise<CollectionInfo>;

  getCollectionStats(collection: string): Promise<CollectionStats>;
}
