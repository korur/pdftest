import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';

export const GET: RequestHandler = async () => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: 'Japanese PDF Report (Server)',
        Author: 'PDF Generator App',
        Subject: 'Sample PDF with selectable Japanese text'
      }
    });

    // Register the Japanese font
    doc.registerFont('NotoSansJP', 'static/fonts/NotoSansJP-Regular.ttf');
    doc.font('NotoSansJP');

    // Set the initial position
    doc.fontSize(24).text('日本語レポート (サーバー)', {
      align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(12).text('これは日本語のテキストを含むPDFレポートです。このテキストは選択可能です。', {
      align: 'left',
      width: 500
    });
    
    doc.moveDown();
    doc.fontSize(14).text('データテーブル', {
      align: 'left'
    });
    
    // Draw a table
    const tableTop = doc.y + 10;
    const tableLeft = 40;
    const colWidths = [40, 120, 120, 120];
    const rowHeight = 30;
    
    // Table headers
    doc.fontSize(10);
    doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
    let currentX = tableLeft;
    
    ['ID', '名前', '部署', '役職'].forEach((header, i) => {
      doc.text(header, currentX + 5, tableTop + 10);
      currentX += colWidths[i];
      if (i < colWidths.length - 1) {
        doc.moveTo(currentX, tableTop).lineTo(currentX, tableTop + rowHeight).stroke();
      }
    });
    
    // Table rows
    const data = [
      { id: '1', name: '田中 太郎', dept: '営業部', role: 'マネージャー' },
      { id: '2', name: '佐藤 花子', dept: '開発部', role: 'シニアエンジニア' },
      { id: '3', name: '鈴木 一郎', dept: 'マーケティング', role: 'ディレクター' },
      { id: '4', name: '高橋 美咲', dept: '人事部', role: 'スペシャリスト' },
      { id: '5', name: '伊藤 健太', dept: '財務部', role: 'アナリスト' }
    ];
    
    let currentY = tableTop + rowHeight;
    
    data.forEach((row, rowIndex) => {
      doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
      
      // Fill alternate rows with light gray
      if (rowIndex % 2 === 1) {
        doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#f5f5f5');
        doc.rect(tableLeft, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
      }
      
      currentX = tableLeft;
      
      [row.id, row.name, row.dept, row.role].forEach((cell, i) => {
        doc.text(cell, currentX + 5, currentY + 10);
        currentX += colWidths[i];
        if (i < colWidths.length - 1) {
          doc.moveTo(currentX, currentY).lineTo(currentX, currentY + rowHeight).stroke();
        }
      });
      
      currentY += rowHeight;
    });
    
    doc.moveDown(2);
    doc.fontSize(10).text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, {
      align: 'right'
    });

    // Finalize the PDF
    doc.end();
    
    // Get the PDF as a buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    
    return new Promise<Response>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="japanese-report-pdfkit.pdf"'
          }
        }));
      });
      
      doc.on('error', (err) => {
        reject(error(500, err.message));
      });
    });
  } catch (err) {
    console.error('Error generating PDF with PDFKit:', err);
    throw error(500, 'Failed to generate PDF');
  }
};
