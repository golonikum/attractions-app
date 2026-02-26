import { Attraction } from "@/types/attraction";
import { Group } from "@/types/group";
import { isAttraction } from "./utils";
import { DEFAULT_ATTRACTION_ZOOM, DEFAULT_GROUP_ZOOM } from "./constants";

export const locateItemOnMainMap = ({
  router,
  item,
}: {
  router: any;
  item: Group | Attraction;
}) => {
  const isGroup = !isAttraction(item);

  const newUrl = `${window.location.pathname}?zoom=${isGroup ? DEFAULT_GROUP_ZOOM : DEFAULT_ATTRACTION_ZOOM}&coordinates=${item.coordinates[1]}%2C${item.coordinates[0]}`;
  window.history.pushState({}, "", newUrl);

  router.push("/main");
};
