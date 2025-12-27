
export interface Attraction {
  id: string;
  groupId: string;
  name: string;
  category: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttractionRequest {
  groupId: string;
  name: string;
  category: string;
  imageUrl?: string;
  description?: string;
}

export interface UpdateAttractionRequest {
  name?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
}
