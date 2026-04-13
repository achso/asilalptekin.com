import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const fontData = await readFile(
    path.join(process.cwd(), 'public/fonts/caveat-700.ttf')
  )

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
      fonts: [{ name: 'Caveat', data: fontData, weight: 700 }],
    }
  )
}
