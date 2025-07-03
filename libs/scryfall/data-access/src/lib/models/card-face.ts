import { ScryfallColors } from './colors';

export interface ScryfallCardFace {
  artist: string;
  artist_id?: string;
  cmc?: number;
  color_indicator?: ScryfallColors;
  colors?: ScryfallColors;
  defense?: string;
  flavor_text?: string;
  illustration_id?: string;
  image_uris?: Object;
  layout?: string;
  loyalty?: string;
  mana_cost: string;
  name: string;
  object: string;
  oracle_id?: string;
  oracle_text?: string;
  power?: string;
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  toughness?: string;
  type_line?: string;
  watermark?: string;
}
