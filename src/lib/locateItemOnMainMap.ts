import { Attraction } from "@/types/attraction";
import { Group } from "@/types/group";
import { isAttraction } from "./utils";
import { DEFAULT_ATTRACTION_ZOOM } from "./constants";

export const locateItemOnMainMap = ({
  router,
  item,
}: {
  router: any;
  item: Group | Attraction;
}) => {
  const isGroup = !isAttraction(item);

  const newUrl = `${window.location.pathname}?zoom=${isGroup ? item.zoom : DEFAULT_ATTRACTION_ZOOM}&coordinates=${item.coordinates[1]}%2C${item.coordinates[0]}`;
  window.history.pushState({}, "", newUrl);

  router.push("/main");
};
