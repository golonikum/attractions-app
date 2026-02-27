import { Attraction } from './attraction';

export interface Group {
  id: string;
  userId: string;
  name: string;
  description: string;
  tag?: string;
  coordinates: [number, number];
  zoom: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithAttractions extends Group {
  attractions: Attraction[];
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  tag?: string;
  coordinates: [number, number];
  zoom: number;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  tag?: string;
  coordinates?: [number, number];
  zoom?: number;
}
