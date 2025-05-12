<script lang="ts">
  import { onMount } from 'svelte';
  import { jsPDF } from 'jspdf';
  
  let loading = false;
  let error = '';
  let fontLoaded = false;
  let fontLoadingTime = 0;
  let fontLoadingStartTime: number;
  
  // We'll load the Japanese font from the static folder on mount
  onMount(async () => {
    try {
      // Record start time
      fontLoadingStartTime = performance.now();
      console.log('Font loading started at:', new Date().toISOString());
      
      // Create a style element to define the font-face
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'NotoSansJP';
          src: url('/fonts/NotoSansJP-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(style);
      
      // Preload the font to ensure it's available
      const font = new FontFace('NotoSansJP', 'url(/fonts/NotoSansJP-Regular.ttf)');
      
      try {
        // Wait for the font to load
        await font.load();
        
        // Add the font to the document fonts
        document.fonts.add(font);
        
        // Calculate loading time
        const endTime = performance.now();
        fontLoadingTime = (endTime - fontLoadingStartTime) / 1000; // Convert to seconds
        
        // Mark as loaded
        fontLoaded = true;
        console.log(`Font loaded successfully in ${fontLoadingTime.toFixed(2)} seconds`);
      } catch (fontError) {
        console.error('Failed to load font from static folder:', fontError);
        error = 'Failed to load Japanese font from static folder';
      }
    } catch (err) {
      console.error('Failed to set up font:', err);
      error = 'Failed to set up Japanese font';
    }
  });
  
  async function generatePDF() {
    loading = true;
    error = '';
    
    try {
      const japaneseText = '日本語のサンプルテキストです。これはPDFレポートに変換されます。';
      
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set properties
      doc.setProperties({
        title: 'Japanese Text Report',
        subject: 'Sample PDF with Japanese text',
        author: 'PDF Generator App',
        creator: 'jsPDF'
      });
      
      // Add a canvas to the document to render the Japanese text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.width = 595; // A4 width in points
      canvas.height = 842; // A4 height in points
      
      // Set background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw title
      ctx.fillStyle = 'black';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Japanese Text Report', canvas.width / 2, 60);
      
      // Draw Japanese text
      ctx.font = '14px "NotoSansJP", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(japaneseText, 60, 120);
      
      // Draw footer
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#646464';
      ctx.textAlign = 'right';
      ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, canvas.width - 60, canvas.height - 60);
      
      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 size in mm
      
      // Save the PDF
      doc.save('japanese-report.pdf');
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      error = 'Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err));
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>PDF Generator</h1>
  
  <div class="content">
    <p>Click the button below to generate a PDF with Japanese text:</p>
    <p class="japanese-text">日本語のサンプルテキストです。これはPDFレポートに変換されます。</p>
    
    {#if !fontLoaded}
      <div class="loading-status">Loading Japanese font...</div>
    {:else}
      <div class="success-status">Font loaded successfully in {fontLoadingTime.toFixed(2)} seconds</div>
    {/if}
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <button on:click={generatePDF} disabled={loading || !fontLoaded}>
      {#if loading}
        Generating PDF...
      {:else}
        Generate PDF Report
      {/if}
    </button>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  h1 {
    color: #333;
    margin-bottom: 2rem;
  }
  
  .content {
    background-color: #f9f9f9;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .japanese-text {
    font-size: 1.2rem;
    margin: 1.5rem 0;
    line-height: 1.6;
  }
  
  .loading-status {
    background-color: #ebf8ff;
    color: #3182ce;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #3182ce;
  }
  
  .success-status {
    background-color: #f0fff4;
    color: #38a169;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #38a169;
  }
  
  .error {
    background-color: #fff0f0;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #e53e3e;
  }
  
  button {
    background-color: #4a6cf7;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #3a5ce5;
  }
  
  button:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
</style>
