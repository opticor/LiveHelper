import './websites'
import { getWebSites, Living } from './types'
import { parseJSON } from './utils'

const Websites = getWebSites()
const DirtyKey = 'dirty'
const UseSyncKey = 'useSync'
const ConfigKey = 'config'
const LastPollKey = 'last_poll'
const PollLastPollKey = 'poll_last_poll'

export interface Config {
  enabled?: Record<string, boolean>
  preference?: {
    interval?: number
    notification?: boolean
    preview?: boolean
    ignoreFirstNotify?: boolean
  }
}
export type Preference = Required<Required<Config>['preference']>

function getArea () : Promise<chrome.storage.StorageArea> {
  // const UseSync = parseJSON(localStorage.getItem(UseSyncKey), false)
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(UseSyncKey, (items: { [key: string]: any }) => {
      const UseSync = items[UseSyncKey];
      const area: chrome.storage.StorageArea = UseSync ? chrome.storage.sync : chrome.storage.local;
      resolve(area);
    });
  });
}

async function get<T> (key: string): Promise<T | undefined> {
  return new Promise((res, rej) => {
    getArea().then((area) => {
      area.get(key, (items) => {
        res(items[key])
      })
    });
  })
}

async function set(key: string, value: unknown): Promise<void> {
  return new Promise((res, rej) => {
    getArea().then((area) => {
      area.set({
        [key]: value
      }, res)
    });
  })
}

export function setConfig (config: Config) {
  return set(ConfigKey, config)
}

export async function getConfig () {
  return await get<Config>(ConfigKey) || {
    preference: {
      interval: 5,
      notification: false,
      preview: true,
      ignoreFirstNotify: true
    }
  }
}

export async function getEnabledWebsites () {
  const cfg = await getConfig()
  return Websites.filter(i => cfg.enabled && cfg.enabled[i.id])
}

export function setLastPoll(value: Record<string, Living>) {
  chrome.storage.local.set({ [LastPollKey]: JSON.stringify(value) })
}

export function getLastPoll(): Promise<Record<string, Living>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(LastPollKey, (items: { [key: string]: Living }) => {
      const lastPoll = items[LastPollKey] || {};
      resolve(parseJSON(lastPoll) || {});
    });
  });
}

export function setWebsitesSort(value: string[]) {
  chrome.storage.local.set({ 'sort': JSON.stringify(value) });
}

export function getWebsitesSort(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('sort', (items: { [key: string]: string }) => {
      const sort = parseJSON(items['sort']) || Websites.map(i => i.id);
      resolve(sort);
    });
  });
}

export function setPollLastPoll(value: number) {
  chrome.storage.local.set({ [PollLastPollKey]: JSON.stringify(value) });
}

export function getPollLastPoll(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(PollLastPollKey, (items: { [key: string]: number }) => {
      const pollLastPoll = parseJSON(items[PollLastPollKey]) || 0;
      resolve(pollLastPoll);
    });
  });
}

export function setDirty() {
  chrome.storage.local.set({ [DirtyKey]: 'true' });
}

export function getDirty(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(DirtyKey, (items: { [key: string]: string }) => {
      const dirty = items[DirtyKey] === 'true';
      chrome.storage.local.remove(DirtyKey);
      resolve(dirty);
    });
  });
}


export async function getInterval() {
  const cfg = await getConfig()
  return cfg.preference?.interval || 5
}

export async function getSendNotification() {
  const cfg = await getConfig()
  return cfg.preference?.notification ?? true
}
