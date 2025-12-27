
export interface Group {
  id: string;
  userId: string;
  name: string;
  description: string;
  tag?: string;
  coordinates: number[]; // [долгота, широта]
  zoom: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  tag?: string;
  coordinates: number[]; // [долгота, широта]
  zoom: number;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  tag?: string;
  coordinates?: number[]; // [долгота, широта]
  zoom?: number;
}
