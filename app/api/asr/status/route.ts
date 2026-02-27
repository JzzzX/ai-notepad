import { NextResponse } from 'next/server';
import { getAsrStatus } from '@/lib/asr';

export function GET() {
  return NextResponse.json(getAsrStatus());
}

