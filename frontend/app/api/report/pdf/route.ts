import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filingId = searchParams.get('filingId') || 'TEST';
  
  return new NextResponse('PDF generation test for filing: ' + filingId, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
