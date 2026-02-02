import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  const fontData = readFileSync(
    join(process.cwd(), 'src', 'assets', 'fonts', 'Montserrat-SemiBold.ttf')
  );

  const logoBuffer = readFileSync(
    join(process.cwd(), 'public', 'logos', 'pgiLogoTransparentDark.png')
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
          backgroundColor: '#ffffff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={72}
          height={72}
          alt=""
          style={{ marginBottom: 28, opacity: 0.85 }}
        />
        <div
          style={{
            fontSize: 52,
            color: '#00172B',
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
            fontSize: 30,
            color: 'rgba(0, 23, 43, 0.55)',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            marginTop: 16,
            letterSpacing: '0.08em',
          }}
        >
          Portal
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
