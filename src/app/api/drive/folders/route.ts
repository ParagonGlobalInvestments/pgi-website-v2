import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId =
    searchParams.get('folderId') || '1ArM8sjxfNGaxxTHeTrjd1I-EqJWHvB49';

  try {
    // Get user session and access token
    const supabase = createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.provider_token) {
      return NextResponse.json(
        { error: 'No Google access token available' },
        { status: 401 }
      );
    }

    // Fetch both folders and files from Google Drive API
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,parents,createdTime,modifiedTime,description,webViewLink)&orderBy=name`,
      {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error('Drive API Error:', errorText);

      if (driveResponse.status === 401) {
        return NextResponse.json(
          { error: 'Google Drive access token expired. Please sign in again.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch items from Google Drive',
          details: errorText,
        },
        { status: driveResponse.status }
      );
    }

    const data = await driveResponse.json();

    // Add some metadata to items for better display
    const enrichedItems = (data.files || []).map(
      (item: any, index: number) => ({
        ...item,
        displayIndex: index,
        lastModified: new Date(item.modifiedTime).toLocaleDateString(),
        created: new Date(item.createdTime).toLocaleDateString(),
      })
    );

    return NextResponse.json({
      items: enrichedItems,
      total: enrichedItems.length,
      parentFolderId: folderId,
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
