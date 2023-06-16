import { registerWebSite, Living, PollError, PollErrorType } from "../types";
import { mapFilter } from "~/utils";

interface Room {
  title: string;
  liveTime: number;
  nickname: string;
  online: number;
  keyframe: string;
  link: string;
}
interface Response {
  code: number;
  data: {
    count: number;
    rooms?: Room[];
  };
  need_login?: number;
}

function getInfoFromItem({
  title,
  liveTime,
  nickname,
  online,
  keyframe,
  link,
}: Room): Living | undefined {
  return {
    title,
    startAt: liveTime,
    author: nickname,
    online,
    preview: keyframe,
    url: link,
  };
}

registerWebSite({
  async getLiving() {
    let page_size = 30;
    let page = 1;
    let totle_remain = 1;
    let Rooms :Room[] = [];

    while(totle_remain > 0) {
      const res = await getPage(page, page_size);
      Rooms = Rooms.concat(res.data.rooms? res.data.rooms: []);
      page++;
      totle_remain = res.data.count - Rooms.length;
    }

    return mapFilter(Rooms, getInfoFromItem);
  },
  id: "bilibili",
  homepage: "https://live.bilibili.com/",
});

async function getPage(page: number, page_size: number) {
  const r = await fetch(
    `https://api.live.bilibili.com/xlive/web-ucenter/v1/xfetter/GetWebList?page=` +
      page +
      `&page_size=` +
      page_size
  );
  const res: Response = await r.json();

  // not login
  if (res.code === -101) {
    throw new PollError(PollErrorType.NotLogin);
  }
  if (res.data.rooms === undefined) {
    throw new PollError(PollErrorType.Other);
  }
  return res;

}