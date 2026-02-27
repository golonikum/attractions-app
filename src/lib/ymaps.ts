import React, { FC, PropsWithChildren } from 'react';
import ReactDom from 'react-dom';
import { YMapGeolocationControlProps, YMapZoomControlProps } from '@yandex/ymaps3-types/packages/controls';
import type {
  YMapControlButtonProps,
  YMapControlsProps,
  YMapDefaultFeaturesLayerProps,
  YMapDefaultSchemeLayerProps,
  YMapListenerProps,
  YMapMarkerProps,
  YMapProps,
  YMapScaleControlProps,
} from 'ymaps3';

// Инициализация Yandex Maps
let ymaps3: any;
let reactify: any;
let YMap: FC<PropsWithChildren<YMapProps>>;
let YMapDefaultSchemeLayer: FC<YMapDefaultSchemeLayerProps>;
let YMapDefaultFeaturesLayer: FC<YMapDefaultFeaturesLayerProps>;
let YMapMarker: FC<PropsWithChildren<YMapMarkerProps>>;
let YMapControls: FC<PropsWithChildren<YMapControlsProps>>;
let YMapControlButton: FC<PropsWithChildren<YMapControlButtonProps>>;
let YMapScaleControl: FC<YMapScaleControlProps>;
let YMapListener: FC<YMapListenerProps>;
let YMapGeolocationControl: FC<YMapGeolocationControlProps>;
let YMapZoomControl: FC<YMapZoomControlProps>;

// Функция для инициализации Yandex Maps
export async function initYMaps() {
  try {
    // Загружаем Yandex Maps API
    ymaps3 = await (window as any).ymaps3;

    ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest');

    // Инициализируем reactify
    const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

    // Создаем reactify и экспортируем компоненты
    reactify = ymaps3React.reactify.bindTo(React, ReactDom);
    const components = reactify.module(ymaps3);
    const themeComponents = reactify.module(await ymaps3.import('@yandex/ymaps3-default-ui-theme'));

    YMap = components.YMap;
    YMapDefaultSchemeLayer = components.YMapDefaultSchemeLayer;
    YMapDefaultFeaturesLayer = components.YMapDefaultFeaturesLayer;
    YMapControls = components.YMapControls;
    YMapControlButton = components.YMapControlButton;
    YMapScaleControl = components.YMapScaleControl;
    YMapMarker = components.YMapMarker;
    YMapListener = components.YMapListener;
    YMapGeolocationControl = themeComponents.YMapGeolocationControl;
    YMapZoomControl = themeComponents.YMapZoomControl;

    return true;
  } catch (error) {
    console.error('Ошибка при инициализации Yandex Maps:', error);

    return false;
  }
}

// Экспортируем компоненты после инициализации
export {
  reactify,
  YMap,
  YMapControlButton,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapDefaultSchemeLayer,
  YMapGeolocationControl,
  YMapListener,
  YMapMarker,
  YMapScaleControl,
  YMapZoomControl,
};
