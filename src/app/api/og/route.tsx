import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  const fontData = readFileSync(
    join(process.cwd(), 'src', 'assets', 'fonts', 'Montserrat-SemiBold.ttf')
  );

  const logoBuffer = readFileSync(
    join(process.cwd(), 'public', 'logos', 'pgiLogoTransparent.png')
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00172B',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={72}
          height={72}
          alt=""
          style={{ marginBottom: 28, opacity: 0.9 }}
        />
        <div
          style={{
            fontSize: 52,
            color: 'white',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Paragon Global Investments
        </div>
        <div
          style={{
            fontSize: 21,
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            marginTop: 18,
            letterSpacing: '0.01em',
          }}
        >
          Intercollegiate quantitative investment fund
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Montserrat',
          data: fontData,
          style: 'normal',
          weight: 600,
        },
      ],
    }
  );
}
