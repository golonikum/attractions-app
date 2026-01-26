import { Attraction, CreateAttractionRequest, UpdateAttractionRequest } from "@/types/attraction";

// Заглушка для данных о достопримечательностях
const attractionsData: Attraction[] = [
  {
    id: "1",
    groupId: "1",
    name: "Красная площадь",
    category: "Историческое место",
    description: "Центральная площадь Москвы, расположенная между Кремлём, Китай-городом и Василевским спуском.",
    imageUrl: "https://example.com/red-square.jpg",
    yaMapUrl: "https://yandex.ru/maps/-/CDgBC~cD",
    coordinates: [37.6232, 55.7525], // [долгота, широта]
    isVisited: true,
    isFavorite: false,
    order: 1,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    groupId: "1",
    name: "Мавзолей Ленина",
    category: "Мемориальное место",
    description: "Мавзолей на Красной площади в Москве, где находится тело Владимира Ильича Ленина.",
    imageUrl: "https://example.com/lenin-mausoleum.jpg",
    yaMapUrl: "https://yandex.ru/maps/-/CDgBC~cD",
    coordinates: [37.6232, 55.7525], // [долгота, широта]
    isVisited: true,
    isFavorite: true,
    order: 2,
    notes: [{ date: "2023-05-01", note: "Посетил в День Победы" }],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

// Имитация задержки API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAttractionsByGroupId = async (groupId: string): Promise<Attraction[]> => {
  await delay(500); // Имитация задержки запроса
  return attractionsData.filter(attraction => attraction.groupId === groupId);
};

export const getAttractionById = async (id: string): Promise<Attraction | null> => {
  await delay(300); // Имитация задержки запроса
  return attractionsData.find(attraction => attraction.id === id) || null;
};

export const createAttraction = async (attractionData: CreateAttractionRequest): Promise<Attraction> => {
  await delay(800); // Имитация задержки запроса

  const newAttraction: Attraction = {
    id: Date.now().toString(),
    groupId: attractionData.groupId,
    name: attractionData.name,
    category: attractionData.category,
    description: attractionData.description,
    imageUrl: attractionData.imageUrl,
    yaMapUrl: attractionData.yaMapUrl,
    isVisited: attractionData.isVisited,
    isFavorite: attractionData.isFavorite,
    coordinates: attractionData.coordinates,
    order: attractionData.order,
    notes: attractionData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  attractionsData.push(newAttraction);
  return newAttraction;
};

export const updateAttraction = async (id: string, updateData: UpdateAttractionRequest): Promise<Attraction> => {
  await delay(600); // Имитация задержки запроса

  const attractionIndex = attractionsData.findIndex(attraction => attraction.id === id);
  if (attractionIndex === -1) {
    throw new Error("Достопримечательность не найдена");
  }

  const updatedAttraction = {
    ...attractionsData[attractionIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  attractionsData[attractionIndex] = updatedAttraction;
  return updatedAttraction;
};

export const deleteAttraction = async (id: string): Promise<void> => {
  await delay(400); // Имитация задержки запроса

  const attractionIndex = attractionsData.findIndex(attraction => attraction.id === id);
  if (attractionIndex === -1) {
    throw new Error("Достопримечательность не найдена");
  }

  attractionsData.splice(attractionIndex, 1);
};
