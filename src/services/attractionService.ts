import { fetchProxy } from "@/lib/fetchProxy";
import { getAuthHeaders } from "@/lib/getAuthHeaders";
import {
  Attraction,
  CreateAttractionRequest,
  UpdateAttractionRequest,
} from "@/types/attraction";

const API_URL = "/api/attractions";

// Get authorization header

export const getAttractionsByGroupId = async (
  groupId: string,
): Promise<Attraction[]> => {
  const response = await fetchProxy(`${API_URL}?groupId=${groupId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить объекта");
  }

  const data = await response.json();
  return data.attractions || [];
};

export const getAllAttractions = async (): Promise<Attraction[]> => {
  const response = await fetchProxy(`${API_URL}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить объекты");
  }

  const data = await response.json();
  return data.attractions || [];
};

export const getAttractionById = async (
  id: string,
): Promise<Attraction | null> => {
  const response = await fetchProxy(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить объект");
  }

  const data = await response.json();
  return data.attraction || null;
};

export const createAttraction = async (
  attractionData: CreateAttractionRequest,
): Promise<Attraction> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(attractionData),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать объект");
  }

  const data = await response.json();
  return data.attraction;
};

export const updateAttraction = async (
  id: string,
  updateData: UpdateAttractionRequest,
): Promise<Attraction> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить объект");
  }

  const data = await response.json();
  return data.attraction;
};

export const deleteAttraction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить объект");
  }
};

export const updateOrder = async (
  groupId: string,
  attractions: { id: string; order: number }[],
) => {
  const response = await fetch("/api/order", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ groupId, attractions }),
  });

  if (!response.ok) {
    throw new Error("Ошибка обновления порядка");
  }

  return response.json();
};
