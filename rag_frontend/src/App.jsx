import { useState, useCallback, useEffect } from 'react'
import { Progress, Steps, Card, Alert, Button, Spin } from 'antd'
import { FileTextOutlined, DownloadOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import UploadPage from './components/UploadPage'
import ReportGenerationPage from './components/ReportGenerationPage'
import ErrorBoundary from './components/ErrorBoundary'
import 'antd/dist/reset.css'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const { Step } = Steps

function App() {
  const [currentStep, setCurrentStep] = useState(0) // 0: upload, 1: processing, 2: report
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [reportUrl, setReportUrl] = useState('')
  const [reportData, setReportData] = useState(null)
  const [costing, setCosting] = useState(null)
  const [currency, setCurrency] = useState('PKR')
  const [documentId, setDocumentId] = useState('')

  // Cleanup PDF preview URL on unmount
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  const processFileWithBackend = useCallback(async (formData) => {
    setIsProcessing(true)
    setErrorMessage('')
    setUploadProgress(0)
    setStatusText('Preparing upload...')
    setCurrentStep(1) // Move to processing step
    console.log('🚀 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      // Create form data for API submission
      // Use the FormData directly from UploadPage
      const backendFormData = formData

      // Simulate upload progress
      setUploadProgress(20)
      setStatusText('Uploading content...')

      // Log the form data being sent
      console.log('🚀 Sending API Request to:', `${API_BASE_URL}/process`);
      console.log('📤 Form Data contents:');
      for (let [key, value] of backendFormData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        body: backendFormData,
      })
      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Headers:', response.headers);
      
      setUploadProgress(50)
      setStatusText('Processing document...')

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`)
      }

      const payload = await response.json()
      
      if (!payload.success) {
        throw new Error(payload.error?.message || 'Processing failed')
      }

      // Extract data from response - pass the entire payload for ReportGenerationPage
      setDocumentId(payload.document_id)
      setReportData(payload) // Pass the entire response, not just payload.data
      setCosting(payload.data.costing)
      setCurrency(formData.currency)

      setUploadProgress(70)
      setStatusText('Generating report...')

      // Extract data from response - pass the entire payload for ReportGenerationPage
setDocumentId(payload.document_id)
setReportData(payload) // Pass the entire response, not just payload.data
setCosting(payload.data.costing)
setCurrency(formData.currency)

setUploadProgress(70)
setStatusText('Processing complete!')

// Log the response to debug
console.log('API Response:', payload)
console.log('Data object:', payload.data)
console.log('Markdown content:', payload.data?.markdown)

setUploadProgress(100)
setStatusText('Complete!')

setTimeout(() => {
  setStatusText('')
  setCurrentStep(2) // Move to report step
}, 1000)

      setUploadProgress(100)
      setStatusText('Complete!')

      setTimeout(() => {
        setStatusText('')
        setCurrentStep(2) // Move to report step
      }, 1000)
    } catch (error) {
      console.error('Failed to process document', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while processing the document.',
      )
      setStatusText('Error occurred')
      setUploadProgress(0)
      setReportData(null)
      setCosting(null)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleBackToUpload = () => {
    setCurrentStep(0)
    // Reset state for new upload
    setPdfPreviewUrl(null)
    setReportUrl('')
    setReportData(null)
    setCosting(null)
    setErrorMessage('')
    setUploadProgress(0)
    setStatusText('')
    setDocumentId('')
  }

  const steps = [
    {
      title: 'Upload Input',
      description: 'Upload a file or enter text',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Processing',
      description: 'AI is processing your document',
      icon: isProcessing ? <Spin size="small" /> : <ClockCircleOutlined />,
    },
    {
      title: 'View Report',
      description: 'Review your generated report',
      icon: <CheckCircleOutlined />,
    },
  ]

  return (
    <div className="page-shell">
      {/* Navigation Header */}
      <header className="nav-header">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">R</div>
            DevGate ReportGen
          </a>
          <nav className="nav-menu">
            <a href="#" className="nav-item">Resources</a>
            <a href="#" className="nav-item dropdown">Pricing</a>
            <a href="#" className="nav-item">Case studies</a>
            <a href="#" className="nav-item">Log in</a>
            <a href="#" className="nav-cta">Start Your Free Trial</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">Professional Report Generation</div>
          <h1 className="hero-title">
            Report Generation <span className="highlight">Made Easy</span>
          </h1>
          <p className="hero-subtitle">
            Transform your documents and ideas into beautiful, print‑ready PDFs in seconds. 
            Upload files or enter your requirements directly - DevGate handles the rest with 
            powerful AI-driven processing.
          </p>
          <div className="hero-cta">
            <a href="#main-content" className="btn-primary">Get Started</a>
            <a href="#" className="btn-secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="steps-container">
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>
      </div>

      {/* Progress Bar (shown when processing) */}
      {isProcessing && (
        <div className="progress-bar-container">
          <Progress
            percent={uploadProgress}
            status={
              errorMessage
                ? 'exception'
                : uploadProgress === 100
                  ? 'success'
                  : 'active'
            }
            strokeColor={
              errorMessage ? undefined : { from: '#3b82f6', to: '#06b6d4' }
            }
          />
          {statusText && (
            <p className="muted-text" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              {statusText}
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-container">
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage('')}
          />
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="main-content">
        <div className="app-container">
          {/* Page Content */}
          {currentStep === 0 && (
            <ErrorBoundary>
              <UploadPage onSubmit={processFileWithBackend} isProcessing={isProcessing} />
            </ErrorBoundary>
          )}
          
          {currentStep === 1 && (
            <Card className="processing-card">
              <div className="processing-content">
                <Spin size="large" />
                <h3>Processing Your Document</h3>
                <p>{statusText || 'Please wait while we process your document...'}</p>
                <Progress percent={uploadProgress} />
              </div>
            </Card>
          )}
          
          {currentStep === 2 && (
            <ErrorBoundary>
              <div className="report-container">
                <div className="report-header">
                  <h2>Your Generated Report</h2>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      if (pdfPreviewUrl) {
                        const link = document.createElement('a')
                        link.href = pdfPreviewUrl
                        link.download = `report-${documentId}.pdf`
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                      } else if (reportUrl) {
                        window.open(reportUrl, '_blank', 'noopener,noreferrer')
                      }
                    }}
                  >
                    Download Report
                  </Button>
                </div>
                
                <ReportGenerationPage 
                  pdfPreviewUrl={pdfPreviewUrl}
                  reportUrl={reportUrl}
                  reportData={reportData}
                  isProcessing={isProcessing}
                  costing={costing}
                  currency={currency}
                  uploadedFile={null}
                  inputMode="file"
                  errorMessage={errorMessage}
                />
                
                <div className="report-actions">
                  <Button onClick={handleBackToUpload}>
                    Generate Another Report
                  </Button>
                </div>
              </div>
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  )
}

export default App