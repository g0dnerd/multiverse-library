export interface ScryfallRelatedCard {
  id: string;
  object: 'related_card';
  component: RelatedCardType;
  name: string;
  type_line: string;
  uri: string;
}

export enum RelatedCardType {
  Token = 'token',
  MeldPart = 'meld_part',
  MeldResult = 'meld_result',
  ComboPiece = 'combo_piece',
}
