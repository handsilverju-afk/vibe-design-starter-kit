export async function enrichWithItunes(albums) {
  const results = await Promise.all(
    albums.map(async (album) => {
      try {
        const query = encodeURIComponent(`${album.title} ${album.artist ?? ''}`.trim())
        const res = await fetch(
          `https://itunes.apple.com/search?term=${query}&entity=musicTrack&country=kr&limit=1`
        )
        const data = await res.json()
        const track = data.results?.[0]
        if (!track) return album
        return {
          ...album,
          artworkUrl: track.artworkUrl100?.replace('100x100bb', '500x500bb') ?? null,
          previewUrl: track.previewUrl ?? null,
          itunesUrl: track.collectionViewUrl ?? null,
        }
      } catch {
        return album
      }
    })
  )
  return results
}
