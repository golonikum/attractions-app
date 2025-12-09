import React from "react";
import ReactDom from "react-dom";
import type { YMapLocationRequest } from "ymaps3";

export const LOCATION: YMapLocationRequest = {
  center: [37.588144, 55.733842],
  zoom: 9,
};

const [ymaps3React] = await Promise.all([
  ymaps3.import("@yandex/ymaps3-reactify"),
  ymaps3.ready,
]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
} = reactify.module(ymaps3);
