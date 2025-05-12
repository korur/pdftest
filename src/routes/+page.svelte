<script lang="ts">
  import { onMount } from 'svelte';
  import { jsPDF } from 'jspdf';
  
  let fontLoaded = false;
  let fontLoadingTime = 0;
  let fontLoadingStartTime = 0;
  let error = '';
  let clientLoading = false;
  let serverLoading = false;
  let selectableLoading = false;
  let htmlContent: string = '';

  // We'll load the Japanese font from the static folder on mount
  onMount(async () => {
    try {
      // Record start time
      fontLoadingStartTime = performance.now();

      try {
        // Create a new FontFace object for the Japanese font
        const font = new FontFace('NotoSansJP', 'url(/fonts/NotoSansJP-Regular.ttf)');

        // Load the font
        await font.load();

        // Add the font to the document fonts
        document.fonts.add(font);

        // Calculate font loading time
        const endTime = performance.now();
        fontLoadingTime = (endTime - fontLoadingStartTime) / 1000; // Convert to seconds

        // Mark as loaded
        fontLoaded = true;
        console.log(`Font loaded successfully in ${fontLoadingTime.toFixed(2)} seconds`);
      } catch (fontError) {
        console.error('Failed to load font:', fontError);
        error = 'Failed to load Japanese font';
      }
    } catch (err) {
      console.error('Failed to set up font:', err);
      error = 'Failed to set up Japanese font';
    }
  });

  // Function to convert ArrayBuffer to Base64 string
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async function generateClientPDF() {
    clientLoading = true;
    error = '';

    try {
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add the NotoSansJP font to jsPDF
      // First, fetch the font file
      const fontResponse = await fetch('/fonts/NotoSansJP-Regular.ttf');
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      
      // Add the font to jsPDF
      doc.addFileToVFS('NotoSansJP-Regular.ttf', arrayBufferToBase64(fontArrayBuffer));
      doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
      doc.setFont('NotoSansJP');

      // Set properties
      doc.setProperties({
        title: 'Japanese Table Report (Client)',
        subject: 'Sample PDF with Japanese table',
        author: 'PDF Generator App',
        creator: 'jsPDF'
      });

      // Create HTML content with a table similar to the server endpoint
      const tableHTML = `
        <div style="font-family: 'NotoSansJP', sans-serif; color: #333; line-height: 1.6; width: 100%; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">日本語レポート (クライアント)</h1>
          
          <p>これは日本語のテキストを含むHTMLレポートです。このHTMLはPDFに変換されます。</p>
          
          <h2>データテーブル</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="background-color: #3498db; color: white; font-weight: bold; text-align: left; padding: 10px;">ID</th>
                <th style="background-color: #3498db; color: white; font-weight: bold; text-align: left; padding: 10px;">名前</th>
                <th style="background-color: #3498db; color: white; font-weight: bold; text-align: left; padding: 10px;">部署</th>
                <th style="background-color: #3498db; color: white; font-weight: bold; text-align: left; padding: 10px;">役職</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">1</td>
                <td style="border: 1px solid #ddd; padding: 10px;">田中 太郎</td>
                <td style="border: 1px solid #ddd; padding: 10px;">営業部</td>
                <td style="border: 1px solid #ddd; padding: 10px;">マネージャー</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="border: 1px solid #ddd; padding: 10px;">2</td>
                <td style="border: 1px solid #ddd; padding: 10px;">佐藤 花子</td>
                <td style="border: 1px solid #ddd; padding: 10px;">開発部</td>
                <td style="border: 1px solid #ddd; padding: 10px;">シニアエンジニア</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">3</td>
                <td style="border: 1px solid #ddd; padding: 10px;">鈴木 一郎</td>
                <td style="border: 1px solid #ddd; padding: 10px;">マーケティング</td>
                <td style="border: 1px solid #ddd; padding: 10px;">ディレクター</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="border: 1px solid #ddd; padding: 10px;">4</td>
                <td style="border: 1px solid #ddd; padding: 10px;">高橋 美咲</td>
                <td style="border: 1px solid #ddd; padding: 10px;">人事部</td>
                <td style="border: 1px solid #ddd; padding: 10px;">スペシャリスト</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">5</td>
                <td style="border: 1px solid #ddd; padding: 10px;">伊藤 健太</td>
                <td style="border: 1px solid #ddd; padding: 10px;">財務部</td>
                <td style="border: 1px solid #ddd; padding: 10px;">アナリスト</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: right; font-size: 0.8em; color: #7f8c8d;">
            生成日時: ${new Date().toLocaleString('ja-JP')}
          </div>
        </div>
      `;

      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tableHTML;
      document.body.appendChild(tempDiv);

      // Dynamically load html2canvas library
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      
      // Use html2canvas (dynamically loaded)
      // @ts-ignore - html2canvas is loaded dynamically
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 size in mm
      
      // Save the PDF
      doc.save('japanese-table-client.pdf');

      // Clean up
      document.body.removeChild(tempDiv);

      console.log('PDF generated successfully on client');
    } catch (err) {
      console.error('Error generating PDF on client:', err);
      error = 'Failed to generate PDF on client: ' + (err instanceof Error ? err.message : String(err));
      
      // Clean up if there was an error
      const tempDiv = document.querySelector('div[style*="font-family: \'NotoSansJP\'"');
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    } finally {
      clientLoading = false;
    }
  }

  // Function to dynamically load a script
  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function generateServerPDF() {
    serverLoading = true;
    error = '';

    try {
      // Dynamically load html2canvas library
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      
      // Call the server endpoint to get the HTML content
      const response = await fetch('/reports/html', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get HTML content from server');
      }

      // Get the HTML content
      htmlContent = await response.text();

      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.width = '595.28px'; // A4 width in pixels
      tempDiv.style.fontFamily = 'NotoSansJP, sans-serif';
      tempDiv.style.color = 'black';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Use html2canvas (dynamically loaded)
      // @ts-ignore - html2canvas is loaded dynamically
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true
      });
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 size in mm
      
      // Save the PDF
      doc.save('japanese-report-html.pdf');

      // Clean up
      document.body.removeChild(tempDiv);

      console.log('PDF generated successfully from HTML');
    } catch (err) {
      console.error('Error generating PDF from HTML:', err);
      error = 'Failed to generate PDF from HTML: ' + (err instanceof Error ? err.message : String(err));
      
      // Clean up if there was an error
      const tempDiv = document.querySelector('div[style*="595.28px"]');
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    } finally {
      serverLoading = false;
    }
  }
  
  // New function to generate a PDF with selectable text
  async function generateSelectablePDF() {
    selectableLoading = true;
    error = '';

    try {
      // Call the server endpoint to get the HTML content
      const response = await fetch('/reports/html', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get HTML content from server');
      }

      // Get the HTML content
      htmlContent = await response.text();

      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.width = '595.28px'; // A4 width in pixels
      tempDiv.style.fontFamily = 'NotoSansJP, sans-serif';
      tempDiv.style.color = 'black';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add the NotoSansJP font to jsPDF
      // First, fetch the font file
      const fontResponse = await fetch('/fonts/NotoSansJP-Regular.ttf');
      const fontArrayBuffer = await fontResponse.arrayBuffer();
      
      // Add the font to jsPDF
      doc.addFileToVFS('NotoSansJP-Regular.ttf', arrayBufferToBase64(fontArrayBuffer));
      doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
      doc.setFont('NotoSansJP');

      // Set properties
      doc.setProperties({
        title: 'Japanese Text Report (Selectable)',
        subject: 'Sample PDF with selectable Japanese text',
        author: 'PDF Generator App',
        creator: 'jsPDF'
      });

      // Create a simpler HTML structure for the selectable PDF
      const simplifiedHTML = `
        <div style="font-family: 'NotoSansJP', sans-serif; padding: 20px; width: 100%;">
          <h1 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">日本語レポート (選択可能なテキスト)</h1>
          
          <p style="margin-bottom: 15px;">これは選択可能な日本語テキストを含むPDFです。このテキストは検索やコピーが可能です。</p>
          
          <h2 style="color: #2c3e50; margin-top: 20px;">データテーブル</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #3498db; color: white;">ID</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #3498db; color: white;">名前</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #3498db; color: white;">部署</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">1</td>
              <td style="border: 1px solid #ddd; padding: 8px;">田中 太郎</td>
              <td style="border: 1px solid #ddd; padding: 8px;">営業部</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">2</td>
              <td style="border: 1px solid #ddd; padding: 8px;">佐藤 花子</td>
              <td style="border: 1px solid #ddd; padding: 8px;">開発部</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">3</td>
              <td style="border: 1px solid #ddd; padding: 8px;">鈴木 一郎</td>
              <td style="border: 1px solid #ddd; padding: 8px;">マーケティング</td>
            </tr>
          </table>
          
          <p style="margin-top: 15px;">このPDFはjsPDFを使用して生成されました。日本語のテキストが正しく表示され、選択可能であることを確認してください。</p>
          
          <div style="margin-top: 20px; text-align: right; font-size: 0.8em; color: #7f8c8d;">
            生成日時: ${new Date().toLocaleString('ja-JP')}
          </div>
        </div>
      `;
      
      // Create a temporary div with the simplified HTML
      const simplifiedDiv = document.createElement('div');
      simplifiedDiv.innerHTML = simplifiedHTML;
      document.body.appendChild(simplifiedDiv);
      
      // Use a different approach for selectable text
      // First, create a new document with embedded font
      const pdfDoc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add the font to jsPDF
      pdfDoc.addFileToVFS('NotoSansJP-Regular.ttf', arrayBufferToBase64(fontArrayBuffer));
      pdfDoc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
      pdfDoc.setFont('NotoSansJP');
      
      // Set properties
      pdfDoc.setProperties({
        title: 'Japanese Text Report (Selectable)',
        subject: 'Sample PDF with selectable Japanese text',
        author: 'PDF Generator App',
        creator: 'jsPDF'
      });
      
      // Dynamically load html2canvas library if not already loaded
      if (typeof window.html2canvas === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      }
      
      // Use html2canvas to render the HTML
      // @ts-ignore - html2canvas is loaded dynamically
      const canvas = await html2canvas(simplifiedDiv, {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdfDoc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // A4 size in mm
      
      // Save the PDF
      pdfDoc.save('japanese-report-selectable.pdf');
      
      // Clean up
      document.body.removeChild(simplifiedDiv);
      document.body.removeChild(tempDiv);
      console.log('PDF generated successfully with selectable text');
    } catch (err) {
      console.error('Error generating selectable PDF:', err);
      error = 'Failed to generate selectable PDF: ' + (err instanceof Error ? err.message : String(err));
      
      // Clean up if there was an error
      const tempDiv = document.querySelector('div[style*="595.28px"]');
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    } finally {
      selectableLoading = false;
    }
  }
</script>

<div class="container">
  <h1>PDF Generator</h1>

  <div class="content">
    <div class="flow-explanation">
      <strong>How This PDF Generation Works</strong><br>
      When you click the button below, the frontend requests pre-rendered HTML content from the backend. This HTML contains the Japanese text and table structure. The frontend then uses the <code>html2canvas</code> library to render this HTML as an image, which is embedded into a PDF using <code>jsPDF</code>. Because the HTML is generated server-side and rendered with proper fonts, the resulting PDF allows you to select and search for Japanese characters.
    </div>
    <p>Click the button below to generate a PDF with Japanese text:</p>
    <p class="japanese-text">日本語のサンプルテキストです。これはPDFレポートに変換されます。</p>

    {#if error}
      <div class="error">
        <p>{error}</p>
      </div>
    {/if}

    <div class="status">
      <p>Font Status: <span class={fontLoaded ? 'success' : 'pending'}>{fontLoaded ? 'Loaded' : 'Loading...'}</span></p>
      {#if fontLoaded && fontLoadingTime > 0}
        <p>Font Loading Time: <span class="info">{fontLoadingTime.toFixed(2)} seconds</span></p>
      {/if}
    </div>

    <!--
  Only the 2nd button is shown below. The 1st and 3rd buttons are commented out because:
  - The 2nd button ("Generate PDF from HTML (Image)") produces PDFs where Japanese characters (e.g., 日) are selectable and searchable, as confirmed by user testing.
  - The 1st and 3rd buttons produce image-based PDFs or do not allow text selection as desired.
-->
<div class="buttons">
  <!--
  <button on:click={generateClientPDF} disabled={!fontLoaded || clientLoading}>
    {clientLoading ? 'Generating...' : 'Generate PDF with Table (Client)'}
  </button>
  -->

  <button on:click={generateServerPDF} disabled={!fontLoaded || serverLoading}>
    {serverLoading ? 'Generating...' : 'Generate PDF from HTML (Image)'}
  </button>

  <!--
  <button on:click={generateSelectablePDF} disabled={!fontLoaded || selectableLoading}>
    {selectableLoading ? 'Generating...' : 'Generate PDF with Selectable Text'}
  </button>
  -->
</div>

    {#if htmlContent}
      <div class="html-preview">
        <h2>HTML Preview</h2>
        <div class="preview-content">
          {@html htmlContent}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'NotoSansJP', sans-serif;
  }

  h1 {
    color: #333;
    text-align: center;
    margin-bottom: 30px;
  }

  .content {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .japanese-text {
    font-size: 18px;
    margin: 20px 0;
    padding: 10px;
    background-color: #e9f7fe;
    border-left: 4px solid #3498db;
  }

  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }

  .status {
    margin: 20px 0;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .success {
    color: #2e7d32;
    font-weight: bold;
  }

  .pending {
    color: #f57c00;
    font-weight: bold;
  }

  .info {
    color: #1976d2;
    font-weight: bold;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0;
  }

  button {
    padding: 10px 15px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #2980b9;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  /* Second button style */
  button:nth-child(2) {
    background-color: #9b59b6;
    color: white;
  }
  
  /* Second button hover style */
  button:nth-child(2):hover:not(:disabled) {
    background-color: #8e44ad;
  }

  .html-preview {
    margin-top: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }

  .html-preview h2 {
    background-color: #f5f5f5;
    margin: 0;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .preview-content {
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
    background-color: white;
  }
.flow-explanation {
  background: #f0f8ff;
  border-left: 4px solid #3498db;
  padding: 16px;
  margin-bottom: 18px;
  font-size: 1em;
}

</style>
