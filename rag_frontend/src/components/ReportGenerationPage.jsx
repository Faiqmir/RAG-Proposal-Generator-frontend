import { useState } from 'react'
import { Button, Card, Table, Spin, Alert, Divider, Tabs } from 'antd'
import { DownloadOutlined, FileTextOutlined, EyeOutlined, FileWordOutlined } from '@ant-design/icons'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import 'antd/dist/reset.css'
import "../App.css";
import MarkdownDisplay from './MarkdownDisplay';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table as DocxTable, TableRow, TableCell, WidthType } from 'docx';

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

      // PDF dimensions and margins - increased for better alignment
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const margin = 20 // Increased to 20mm for better padding
      const contentWidth = pageWidth - (margin * 2)
      
      // Add title with currency info if available - better positioning
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      const title = uploadedFile 
        ? uploadedFile.name.replace(/\.[^/.]+$/, '') + ' Report'
        : 'Generated Report'
      pdf.text(title, pageWidth / 2, margin + 5, { align: 'center' })
      
      // Add currency indicator if specified
      if (currency && currency !== 'USD') {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Currency: ${currency}`, pageWidth / 2, margin + 12, { align: 'center' })
      }

      // Use html2canvas to capture the styled markdown content with better settings
      console.log('Starting html2canvas...')
      const canvas = await html2canvas(markdownElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: markdownElement.scrollWidth,
        height: markdownElement.scrollHeight,
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      })

      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height)
      const imgData = canvas.toDataURL('image/png')
      console.log('Image data created, length:', imgData.length)
      
      // Calculate dimensions to fit within margins with better alignment
      const imgWidth = contentWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = margin + 20 // Better spacing after title

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
      // Fallback to opening report URL if available
      if (reportUrl) {
        window.open(reportUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const handleExportDOCX = async () => {
    if (!markdownContent) {
      console.error('No markdown content to export')
      return
    }

    try {
      // Show loading state
      const buttons = document.querySelectorAll('.export-button')
      const originalStates = []
      buttons.forEach(button => {
        if (button.textContent.includes('DOCX')) {
          originalStates.push({ button, text: button.innerHTML, disabled: button.disabled })
          button.innerHTML = '<span>Generating DOCX...</span>'
          button.disabled = true
        }
      })

      console.log('DOCX generation started...')
      
      // Parse markdown content exactly as shown in frontend
      const lines = markdownContent.split('\n')
      const docxChildren = []
      
      // Add title
      const title = uploadedFile 
        ? uploadedFile.name.replace(/\.[^/.]+$/, '') + ' Report'
        : 'Generated Report'
      
      docxChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      )

      // Add currency info if specified
      if (currency && currency !== 'USD') {
        docxChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Currency: ${currency}`,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          })
        )
      }

      // Process markdown lines exactly preserving structure
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // Preserve empty lines exactly as in markdown
        if (!line.trim()) {
          docxChildren.push(
            new Paragraph({
              children: [],
              spacing: { after: 200 },
            })
          )
          continue
        }

        // Check for markdown table - detect by pipe characters
        if (line.includes('|') && line.split('|').length > 2) {
          // Parse complete table including all rows
          const tableResult = parseMarkdownTable(lines, i)
          if (tableResult.tableRows.length > 0) {
            // Create DOCX table with proper formatting
            const tableRows = tableResult.tableRows.map((rowData, rowIndex) => {
              const isHeader = rowIndex === 0 || (rowIndex === 1 && tableResult.tableRows[0].length === rowData.length)
              
              return new TableRow({
                children: rowData.map(cellData => 
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: cellData || '',
                            bold: isHeader,
                            size: 20,
                          }),
                        ],
                        spacing: { after: 100 },
                      })
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                    shading: isHeader ? {
                      fill: "E8F4FD",
                      type: "solid",
                    } : undefined,
                  })
                ),
              })
            })
            
            const docxTable = new DocxTable({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
            
            docxChildren.push(docxTable)
            docxChildren.push(
              new Paragraph({
                children: [],
                spacing: { after: 400 },
              })
            )
            
            i = tableResult.nextIndex - 1
            continue
          }
        }

        // Headers - preserve exact text with professional formatting
        if (line.startsWith('# ')) {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(2),
                  bold: true,
                  size: 32,
                  color: "2C3E50",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 600, after: 300 },
              border: {
                bottom: {
                  color: "3498DB",
                  size: 2,
                  style: BorderStyle.SINGLE,
                },
              },
            })
          )
        } else if (line.startsWith('## ')) {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(3),
                  bold: true,
                  size: 26,
                  color: "34495E",
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 250 },
            })
          )
        } else if (line.startsWith('### ')) {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(4),
                  bold: true,
                  size: 22,
                  color: "2C3E50",
                }),
              ],
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 300, after: 200 },
            })
          )
        } else if (line.startsWith('#### ')) {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.substring(5),
                  bold: true,
                  size: 20,
                  color: "34495E",
                }),
              ],
              heading: HeadingLevel.HEADING_4,
              spacing: { before: 200, after: 150 },
            })
          )
        } 
        // Enhanced bullet points with bold text support
        else if (line.trim().match(/^[-*●]\s+/)) {
          const bulletText = line.trim().replace(/^[-*●]\s+/, '')
          const textRuns = []
          
          // Handle bold text within bullet points: **text**
          const boldMatches = bulletText.match(/\*\*(.*?)\*\*/g)
          if (boldMatches) {
            let lastIndex = 0
            boldMatches.forEach(match => {
              const boldText = match.slice(2, -2)
              const matchIndex = bulletText.indexOf(match)
              
              // Add text before bold
              if (matchIndex > lastIndex) {
                textRuns.push(
                  new TextRun({
                    text: bulletText.substring(lastIndex, matchIndex),
                    size: 22,
                    color: "2C3E50",
                  })
                )
              }
              
              // Add bold text
              textRuns.push(
                new TextRun({
                  text: boldText,
                  bold: true,
                  size: 22,
                  color: "2C3E50",
                })
              )
              
              lastIndex = matchIndex + match.length
            })
            
            // Add remaining text
            if (lastIndex < bulletText.length) {
              textRuns.push(
                new TextRun({
                  text: bulletText.substring(lastIndex),
                  size: 22,
                  color: "2C3E50",
                })
              )
            }
          } else {
            textRuns.push(
              new TextRun({
                text: bulletText,
                size: 22,
                color: "2C3E50",
              })
            )
          }
          
          docxChildren.push(
            new Paragraph({
              children: textRuns,
              bullet: {
                level: 0,
              },
              spacing: { after: 200 },
              indent: { left: 720 }, // Proper indentation for bullets
            })
          )
        } 
        // Regular paragraph with enhanced formatting
        else {
          // Handle inline bold text **text** and other formatting
          const textRuns = []
          let remainingText = line
          
          // Process bold text **text**
          const boldMatches = remainingText.match(/\*\*(.*?)\*\*/g)
          if (boldMatches) {
            let lastIndex = 0
            boldMatches.forEach(match => {
              const boldText = match.slice(2, -2)
              const matchIndex = remainingText.indexOf(match)
              
              // Add text before bold
              if (matchIndex > lastIndex) {
                textRuns.push(
                  new TextRun({
                    text: remainingText.substring(lastIndex, matchIndex),
                    size: 22,
                    color: "2C3E50",
                  })
                )
              }
              
              // Add bold text
              textRuns.push(
                new TextRun({
                  text: boldText,
                  bold: true,
                  size: 22,
                  color: "2C3E50",
                })
              )
              
              lastIndex = matchIndex + match.length
            })
            
            // Add remaining text
            if (lastIndex < remainingText.length) {
              textRuns.push(
                new TextRun({
                  text: remainingText.substring(lastIndex),
                  size: 22,
                  color: "2C3E50",
                })
              )
            }
          } else {
            textRuns.push(
              new TextRun({
                text: line,
                size: 22,
                color: "2C3E50",
              })
            )
          }
          
          docxChildren.push(
            new Paragraph({
              children: textRuns,
              spacing: { after: 200 },
              lineSpacing: 1.15, // Better line spacing for readability
            })
          )
        }
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxChildren,
          },
        ],
      })

      // Generate filename
      const baseName = uploadedFile
        ? uploadedFile.name.replace(/\.[^/.]+$/, '')
        : 'report'

      // Create and download DOCX
      const buffer = await Packer.toBlob(doc)
      const url = URL.createObjectURL(buffer)
      const link = document.createElement('a')
      link.href = url
      link.download = `${baseName}-report.docx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      console.log('DOCX generated successfully')

      // Restore button states
      originalStates.forEach(({ button, text, disabled }) => {
        button.innerHTML = text
        button.disabled = disabled
      })

    } catch (error) {
      console.error('Error generating DOCX:', error)
      
      // Restore button states
      const buttons = document.querySelectorAll('.export-button')
      buttons.forEach(button => {
        if (button.textContent.includes('Generating')) {
          button.innerHTML = '<span><FileWordOutlined /> Export DOCX</span>'
          button.disabled = false
        }
      })
      
      // Fallback to opening report URL if available
      if (reportUrl) {
        window.open(reportUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  // Helper function to parse markdown tables exactly
  const parseMarkdownTable = (lines, startIndex) => {
    const tableRows = []
    let i = startIndex
    
    // Find all table rows
    while (i < lines.length) {
      const line = lines[i]
      
      // Stop if not a table row
      if (!line.includes('|') || line.split('|').length < 3) {
        break
      }
      
      // Skip separator line (|---|---|---|)
      if (line.match(/^\|[\s\-\|:]+\|$/)) {
        i++
        continue
      }
      
      // Parse table row - preserve exact content
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '') // Remove empty cells from start/end
      
      if (cells.length > 0) {
        tableRows.push(cells)
      }
      
      i++
    }
    
    return {
      tableRows: tableRows,
      nextIndex: i
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
          <div className="export-buttons">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              disabled={!markdownContent}
              loading={isProcessing}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
            <Button
              type="default"
              icon={<FileWordOutlined />}
              disabled={!markdownContent}
              loading={isProcessing}
              onClick={handleExportDOCX}
              className="export-button"
            >
              Export DOCX
            </Button>
          </div>
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