import { NextResponse } from 'next/server';
import { getSupportedCountries } from '@/lib/countries';

export async function GET() {
  try {
    const countries = getSupportedCountries();
    
    return NextResponse.json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Countries API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
