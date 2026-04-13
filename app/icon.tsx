import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  // Fetch Caveat 700 via Google Fonts CSS API to get the actual woff2 URL
  const fontRes = await fetch(
    'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap',
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } }
  )
  const css = await fontRes.text()
  const fontUrl = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)?.[1]

  const fontData = fontUrl
    ? await fetch(fontUrl).then((r) => r.arrayBuffer())
    : undefined

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          fontFamily: 'Caveat',
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
        }}
      >
        A.
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Caveat', data: fontData, weight: 700 as const }]
        : [],
    }
  )
}
