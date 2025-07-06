export interface BulkDataItems {
  object: 'list';
  has_more: boolean;
  data: BulkData[];
}

export interface BulkData {
  id: string;
  uri: string;
  type: BulkDataType;
  name: string;
  description: string;
  download_uri: string;
  updated_at: string;
  size: number;
  content_type: string;
  content_encoding: string;
}

export enum BulkDataType {
  OracleCards = 'oracle_cards',
  UniqueArtwork = 'unique_artwork',
  DefaultCards = 'default_cards',
  AllCards = 'all_cards',
  Rulings = 'rulings',
}
