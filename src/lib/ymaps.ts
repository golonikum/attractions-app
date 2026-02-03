import React from "react";
import ReactDom from "react-dom";
import type { YMapLocationRequest } from "ymaps3";

// Инициализация Yandex Maps
let ymaps3: any;
let reactify: any;
let YMap: any;
let YMapDefaultSchemeLayer: any;
let YMapDefaultFeaturesLayer: any;
let YMapMarker: any;
let YMapControls: any;
let YMapZoomControl: any;

export const LOCATION: YMapLocationRequest = {
  center: [37.588144, 55.733842],
  zoom: 9,
};

// Функция для инициализации Yandex Maps
export async function initYMaps() {
  try {
    // Загружаем Yandex Maps API
    ymaps3 = await (window as any).ymaps3;

    // Инициализируем reactify
    const [ymaps3React] = await Promise.all([
      ymaps3.import("@yandex/ymaps3-reactify"),
      ymaps3.ready,
    ]);

    // Создаем reactify и экспортируем компоненты
    reactify = ymaps3React.reactify.bindTo(React, ReactDom);
    const components = reactify.module(ymaps3);

    YMap = components.YMap;
    YMapDefaultSchemeLayer = components.YMapDefaultSchemeLayer;
    YMapDefaultFeaturesLayer = components.YMapDefaultFeaturesLayer;
    YMapControls = components.YMapControls;
    YMapZoomControl = components.YMapZoomControl;

    return true;
  } catch (error) {
    console.error("Ошибка при инициализации Yandex Maps:", error);
    return false;
  }
}

// Экспортируем компоненты после инициализации
export {
  reactify,
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapControls,
  YMapZoomControl,
};
