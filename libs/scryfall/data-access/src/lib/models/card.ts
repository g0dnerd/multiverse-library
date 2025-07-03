import { ScryfallCardFace } from './card-face';
import { ScryfallColors } from './colors';
import { Finish } from './finishes';
import { Frame, FrameEffect } from './frame';
import { Game } from './game';
import { ImageUris } from './image';
import { ScryfallLanguage } from './language';
import { Legalities } from './legalities';
import { ScryfallRelatedCard } from './related-card';

export type ScryfallCard = ScryfallCardCoreFields &
  ScryfallCardGameplayFields &
  ScryfallCardPrintFields;

interface ScryfallCardCoreFields {
  id: string;
  lang: ScryfallLanguage;
  object: 'card';
  layout: string;
  prints_search_uri: string;
  rulings_uri: string;
  scryfall_uri: string;
  uri: string;
  arena_id?: number;
  mtgo_id?: number;
  mtgo_foil_id?: number;
  multiverse_ids?: number[];
  tcgplayer_id?: number;
  tcgplayer_etched_id?: number;
  cardmarket_id?: number;
  oracle_id?: string;
}

interface ScryfallCardGameplayFields {
  all_parts?: ScryfallRelatedCard[];
  card_faces?: ScryfallCardFace[];
  cmc: number;
  color_identity: ScryfallColors;
  color_indicator?: ScryfallColors;
  colors: ScryfallColors;
  defense?: string;
  edhrec_rank?: number;
  game_changer?: boolean;
  hand_modifier?: string;
  keywords?: string[];
  legalities: Legalities;
  life_modifier?: string;
  loyalty?: string;
  mana_cost?: string;
  name: string;
  oracle_text?: string;
  penny_rank?: string;
  power?: string;
  produced_mana?: ScryfallColors;
  reserved: boolean;
  toughness?: string;
  type_line: string;
}

export interface ScryfallCardPrintFields {
  artist?: string;
  artist_ids?: string[];
  attraction_lights?: string[];
  booster: boolean;
  border_color: string;
  card_back_id: string;
  collector_number: string;
  content_warning?: Boolean;
  digital: boolean;
  finishes: Finish[];
  flavor_name?: string;
  flavor_text?: string;
  frame_effects?: FrameEffect[];
  frame: Frame;
  full_art: boolean;
  games: Game[];
  highres_image: boolean;
  illustration_id?: string;
  image_status: string;
  image_uris?: ImageUris;
  oversized: boolean;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    usd_etched: string | null;
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  };
  printed_name?: string;
  printed_text?: string;
  printed_type_line?: string;
  promo: boolean;
  promo_types?: string[];
  purchase_uris?: {
    tcgplayer?: string;
    cardmarket?: string;
    cardhoarder?: string;
  };
  rarity: string;
  related_uris: {
    [name: string]: string;
  };
  released_at: string;
  reprint: boolean;
  scryfall_set_uri: string;
  set_name: string;
  set_search_uri: string;
  set_type: string;
  set_uri: string;
  set: string;
  set_id: string;
  story_spotlight: boolean;
  textless: boolean;
  variation: boolean;
  variation_of?: string;
  security_stamp?: string;
  watermark?: string;
  preview?: {
    previewed_at?: string;
    source_uri?: string;
    source?: string;
  };
}
