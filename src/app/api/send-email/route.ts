import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json();
    
    // Aquí puedes integrar con tu webhook de N8N o servicio de email
    // Por ahora, simulamos el envío
    console.log('Email data received:', {
      patientData: emailData.patientData,
      pdfCount: emailData.pdfs?.length || 0,
      timestamp: emailData.timestamp
    });

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'PDFs sent successfully',
      patientEmail: emailData.patientData.email,
      pdfCount: emailData.pdfs?.length || 0
    });

  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email' 
      },
      { status: 500 }
    );
  }
}
