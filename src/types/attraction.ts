export interface Attraction {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  category?: string;
  imageUrl?: string;
  yaMapUrl?: string;
  description?: string;
  isVisited?: boolean;
  isFavorite?: boolean;
  coordinates: [number, number]; // [долгота, широта]
  order?: number;
  notes?: Array<NoteType>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttractionRequest {
  groupId: string;
  name: string;
  category?: string;
  imageUrl?: string;
  yaMapUrl?: string;
  description?: string;
  isVisited?: boolean;
  isFavorite?: boolean;
  coordinates: [number, number]; // [долгота, широта]
  order?: number;
  notes?: Array<NoteType>;
}

export type UpdateAttractionRequest = Partial<Omit<CreateAttractionRequest, 'groupId'>>;

export interface NoteType {
  date: string;
  note: string;
}

export interface NoteWithAttractionIdType {
  date: string;
  note: string;
  attractionId: string;
}
