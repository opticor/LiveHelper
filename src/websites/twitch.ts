import { registerWebSite, Living, PollError, PollErrorType } from '../types'
import { mapFilter, getCookie } from '~/utils'

const ClientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko'
const GqlRequest = `[{
  "operationName": "FollowingLive_CurrentUser",
  "variables": {
    "imageWidth": 50,
    "limit": 30
  },
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "26fa7fb132379e29dc9dc5757ced2d2259ae0ab69460e2b9a7db9cff60e57cd2"
    }
  }
}]`

interface Room {
  node:{
    displayName: string
    login: string
    profileImageURL: string
    stream: {
      title: string
      viewersCount: number
      previewImageURL: string
    }
  }
}
interface Response {
  data: {
    currentUser: {
      followedLiveUsers: {
        edges: Room[]
      }
      id: string
    } | null
    list: Room[]
  }
}

function getInfoFromItem ({
  node:{
    displayName,
    login,
    profileImageURL,
    stream: {
      title,
      viewersCount,
      previewImageURL,
    }
  }
}: Room): Living | undefined {
  return {
    title,
    startAt: null,
    author: displayName,
    online: viewersCount,
    avatarUrl: profileImageURL,
    preview: previewImageURL,
    url: `https://www.twitch.tv/${login}`
  }
}

registerWebSite({
  async getLiving () {
    const authToken = await getCookie({url: 'https://www.twitch.tv', name: 'auth-token'})
    if (authToken === null) {
      throw new PollError(PollErrorType.NotLogin)
    }
    const r = await fetch(`https://gql.twitch.tv/gql`, {
      method: 'POST',
      headers: {
        'Client-ID': ClientId,
        'Authorization': `OAuth ${authToken.value}`
      },
      body: GqlRequest,
    })
    const [ res ]: Response[] = await r.json()
    if (res.data.currentUser === null) {
      throw new PollError(PollErrorType.NotLogin)
    }

    return mapFilter(res.data.currentUser.followedLiveUsers.edges, getInfoFromItem)
  },
  id: 'twitch',
  homepage: 'https://www.twitch.tv/'
})
