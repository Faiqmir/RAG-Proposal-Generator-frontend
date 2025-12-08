import { useState } from 'react'
import { Button, Card, Table, Spin, Alert, Divider, Tabs } from 'antd'
import { DownloadOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import 'antd/dist/reset.css'
import "../App.css";
import MarkdownDisplay from './MarkdownDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { TabPane } = Tabs;

function ReportGenerationPage({ 
  pdfPreviewUrl, 
  reportUrl, 
  isProcessing, 
  costing, 
  currency, 
  uploadedFile, 
  inputMode,
  errorMessage,
  reportData // New prop for the structured report data
}) {
  const exchangeRates = {
    USD: 1,
    PKR: 280,
    EUR: 0.92,
  }

  const formatCurrency = (amount, currencyCode) => {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${currencyCode} ${formatter.format(amount)}`
  }

  const handleExportPDF = async () => {
    // If there's already a PDF preview, download it
    if (pdfPreviewUrl) {
      const link = document.createElement('a')
      link.href = pdfPreviewUrl
      const baseName = uploadedFile
        ? uploadedFile.name.replace(/\.[^/.]+$/, '')
        : 'processed'
      link.download = `${baseName}-report.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      return
    }
    
    // Generate PDF from markdown content
    if (!markdownContent) {
      console.error('No markdown content to export')
      return
    }

    try {
      // Show loading state
      const button = document.querySelector('button[type="primary"]')
      const originalText = button?.innerHTML
      if (button) {
        button.innerHTML = '<span>Generating PDF...</span>'
        button.disabled = true
      }

      // Find the markdown content element
      const markdownElement = document.querySelector('.markdown-content')
      if (!markdownElement) {
        console.error('Markdown content element not found')
        return
      }

      console.log('PDF generation started...')
      console.log('Markdown element found:', markdownElement)
      console.log('Markdown content length:', markdownElement.textContent.length)

      // Store original content to restore later
      const originalContent = markdownElement.innerHTML
      
      // Temporarily disable HR table removal to ensure costing table appears
      // Remove HR table before PDF generation (more specific approach)
      /*
      const tables = markdownElement.querySelectorAll('table')
      tables.forEach(table => {
        const headers = table.querySelectorAll('th')
        let isHRTable = false
        for (const th of headers) {
          // Check if this is specifically the HR table (not costing table)
          if (th.textContent.trim() === 'Hourly Rate' && 
              !th.textContent.includes('Cost') && 
              !th.textContent.includes('Total')) {
            isHRTable = true
            break
          }
        }
        if (isHRTable) {
          console.log('Removing HR table...')
          table.remove()
        }
      })
      */
      console.log('Skipping HR table removal to ensure costing table is preserved')

      // Create PDF with proper margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // PDF dimensions and margins
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const margin = 15 // 15mm margins
      const contentWidth = pageWidth - (margin * 2)
      
      // Add title with currency info if available
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      const title = uploadedFile 
        ? uploadedFile.name.replace(/\.[^/.]+$/, '') + ' Report'
        : 'Generated Report'
      pdf.text(title, pageWidth / 2, margin, { align: 'center' })
      
      // Add currency indicator if specified
      if (currency && currency !== 'USD') {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Currency: ${currency}`, pageWidth / 2, margin + 8, { align: 'center' })
      }

      // Use html2canvas to capture the styled markdown content
      console.log('Starting html2canvas...')
      const canvas = await html2canvas(markdownElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: markdownElement.scrollWidth,
        height: markdownElement.scrollHeight,
        logging: false
      })

      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height)
      const imgData = canvas.toDataURL('image/png')
      console.log('Image data created, length:', imgData.length)
      
      // Calculate dimensions to fit within margins
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = margin + 15 // Start after title

      // Add first page
      if (heightLeft <= pageHeight - margin - 20) {
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
      } else {
        // Split across multiple pages
        const pageContentHeight = pageHeight - margin - 20
        let sourceY = 0
        
        while (heightLeft > 0) {
          // Add new page if not the first page
          if (sourceY > 0) {
            pdf.addPage()
            position = margin
          }
          
          // Calculate the portion of image to show
          const portionHeight = Math.min(pageContentHeight, heightLeft)
          const sourceHeight = (portionHeight * canvas.height) / imgHeight
          
          // Create a temporary canvas for this portion
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = canvas.width
          tempCanvas.height = sourceHeight
          const tempCtx = tempCanvas.getContext('2d')
          
          // Draw the portion of the original canvas
          tempCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          )
          
          const portionImgData = tempCanvas.toDataURL('image/png')
          pdf.addImage(portionImgData, 'PNG', margin, position, imgWidth, portionHeight)
          
          heightLeft -= portionHeight
          sourceY += sourceHeight
          position = margin
        }
      }

      // Add footer with page numbers
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const footerText = `Page ${i} of ${totalPages}`
        pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })
      }

      // Generate filename
      const baseName = uploadedFile
        ? uploadedFile.name.replace(/\.[^/.]+$/, '')
        : 'report'
      
      // Save the PDF
      pdf.save(`${baseName}-report.pdf`)

      // Restore original content
      markdownElement.innerHTML = originalContent

      // Restore button state
      if (button) {
        button.innerHTML = originalText
        button.disabled = false
      }

    } catch (error) {
      console.error('Error generating PDF:', error)
      
      // Restore original content in case of error
      if (originalContent) {
        markdownElement.innerHTML = originalContent
      }
      
      // Restore button state
      const button = document.querySelector('button[type="primary"]')
      if (button) {
        button.innerHTML = originalText
        button.disabled = false
      }
      
      // Fallback to opening report URL if available
      if (reportUrl) {
        window.open(reportUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  // Get markdown content from reportData and remove wrapper
  const rawMarkdown = reportData?.data?.markdown || '';
  const markdownContent = rawMarkdown
    .replace(/^```markdown\s*\n/, '')  // Remove opening ```markdown
    .replace(/\n```$/, '')           // Remove closing ```
    .trim();
  
  return (
    <div className="report-page-container">
      <div className="panel preview-panel">
        <div className="panel-header-row">
          <h2>2. Generated Report & Export</h2>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!markdownContent}
            loading={isProcessing}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </div>

        <p className="muted-text">
          Preview the generated report from your backend. The report will be created based on your {inputMode === 'file' ? 'uploaded file' : 'text requirements'}.
        </p>

        {isProcessing ? (
          <div className="processing-container">
            <Spin size="large" />
            <p className="processing-text">Processing your document...</p>
          </div>
        ) : (
          <>
            {/* Tab View for Different Report Formats */}
            <Tabs defaultActiveKey="markdown" className="report-tabs">
              <TabPane 
                tab={
                  <span>
                    <EyeOutlined />
                    Markdown View
                  </span>
                } 
                key="markdown"
              >
                {markdownContent ? (
                  <MarkdownDisplay markdown={markdownContent} />
                ) : (
                  <div className="pdf-placeholder">
                    <p className="muted-text">No markdown content available.</p>
                  </div>
                )}
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined />
                    PDF Preview
                  </span>
                } 
                key="pdf"
              >
                {pdfPreviewUrl ? (
                  <div className="pdf-viewer">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer fileUrl={pdfPreviewUrl} />
                    </Worker>
                  </div>
                ) : reportUrl ? (
                  <div className="pdf-placeholder">
                    <p className="muted-text">
                      Report available at{' '}
                      <a href={reportUrl} target="_blank" rel="noreferrer">
                        {reportUrl}
                      </a>
                      . Loading preview…
                    </p>
                  </div>
                ) : (
                  <div className="pdf-placeholder">
                    <p className="muted-text">Generated PDF will appear here once available.</p>
                  </div>
                )}
              </TabPane>
            </Tabs>

            <p className="muted-text processing-hint">
              {isProcessing
                ? 'Processing in progress…'
                : `${inputMode === 'file' ? 'Upload a file' : 'Enter your requirements'}, choose your settings, then run the master or custom command to generate a report.`}
            </p>

            {reportUrl && (
              <p className="muted-text hint-text">
                Report URL:{' '}
                <a href={reportUrl} target="_blank" rel="noreferrer">
                  {reportUrl}
                </a>
              </p>
            )}
            
            {errorMessage && (
              <Alert 
                message="Error" 
                description={errorMessage} 
                type="error" 
                showIcon 
                style={{ marginTop: '40px' }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportGenerationPage