import { useCallback, useMemo, useState } from 'react'
import { Upload, Button, Progress, Input, Radio, Select, InputNumber } from 'antd'
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import 'antd/dist/reset.css'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001'

const { Dragger } = Upload
const { TextArea } = Input

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [reportUrl, setReportUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [userCommand, setUserCommand] = useState('')
  const [commandMode, setCommandMode] = useState('master')
  const [developerCount, setDeveloperCount] = useState(1)
  const [projectBudget, setProjectBudget] = useState(5000)

  const processFileWithBackend = useCallback(async (file, command, mode = 'master') => {
    if (!file) {
      setErrorMessage('Please upload a PDF before submitting a command.')
      return
    }

    if (mode === 'custom' && !command?.trim()) {
      setErrorMessage('Please enter a command for the backend.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    setUploadProgress(0)
    setStatusText('Preparing upload...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)
    formData.append('instruction', mode === 'custom' ? command.trim() : '')
    console.log('inside function developerCount', developerCount)
    console.log('inside function projectBudget', projectBudget)
    formData.append('developer_count', String(developerCount))
    formData.append('project_budget', String(projectBudget))
    try {
      // Simulate upload progress
      setUploadProgress(20)
      setStatusText('Uploading file...')

      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(50)
      setStatusText('Processing file...')

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`)
      }

      const payload = await response.json()
      if (!payload?.report_url) {
        throw new Error('Response missing report_url.')
      }

      setUploadProgress(70)
      setStatusText('Generating report...')

      const absoluteReportUrl = payload.report_url.startsWith('http')
        ? payload.report_url
        : `${API_BASE_URL}${payload.report_url}`

      setReportUrl(absoluteReportUrl)

      setUploadProgress(85)
      setStatusText('Fetching generated PDF...')

      const pdfResponse = await fetch(absoluteReportUrl)
      if (!pdfResponse.ok) {
        throw new Error('Unable to fetch generated PDF.')
      }

      const blob = await pdfResponse.blob()
      const pdfBlob = new Blob([blob], { type: "application/pdf" })
      const nextUrl = URL.createObjectURL(pdfBlob)
      
      setPdfPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return nextUrl
      })
      

      setUploadProgress(100)
      setStatusText('Complete!')
      
      // Clear status text after a moment
      setTimeout(() => {
        setStatusText('')
      }, 2000)
    } catch (error) {
      console.error('Failed to process PDF', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while processing the PDF.'
      )
      setStatusText('Error occurred')
      setUploadProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }, [developerCount, projectBudget])

  const uploadProps = useMemo(
    () => ({
      name: 'file',
      multiple: false,
      maxCount: 1,
      accept: '.pdf,.txt',
      beforeUpload: (file) => {
        setUploadedFile(file)
        return false
      },
      onRemove: () => {
        setUploadedFile(null)
        setPdfPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
        setReportUrl('')
        setUploadProgress(0)
        setStatusText('')
        setUserCommand('')
        setCommandMode('master')
        return true
      },
    }),
    [processFileWithBackend]
  )
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-nav">
            <div className="hero-logo">
              <span className="hero-logo-mark" />
              <span className="hero-logo-text">DevGate ReportGen</span>
            </div>
            <button type="button" className="hero-toggle-pill">
              RAG PDF Studio
            </button>
          </div>

          <div className="hero-main">
            <div className="hero-pill">Professional PDF Generation</div>
            <h1 className="hero-title">
              Generate <span className="hero-highlight">Professional Reports</span> in Seconds
            </h1>
            <p className="hero-subtitle">
              Turn unstructured documents into beautiful, print‑ready PDFs. DevGate combines powerful RAG agents
              with a streamlined workflow so your team can focus on insights, not formatting.
            </p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-container panels-layout">
          <section className="panel upload-panel">
        <h2>1. Upload PDF</h2>
        <p className="muted-text">
           Drag and drop or browse for a single PDF file.
        </p>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag a PDF to this area</p>
          <p className="ant-upload-hint">
            The file will be kept client-side until you wire up the backend call.
          </p>
          {uploadedFile && (
            <p className="muted-text selected-file">Selected file: {uploadedFile.name}</p>
          )}
        </Dragger>
        {(isProcessing || uploadProgress > 0) && (
          <div style={{ marginTop: '1rem' }}>
            <Progress
              percent={uploadProgress}
              status={errorMessage ? 'exception' : uploadProgress === 100 ? 'success' : 'active'}
              strokeColor={errorMessage ? undefined : { from: '#FF6B35', to: '#FF8C42' }}
            />
            {statusText && (
              <p className="muted-text" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                {statusText}
              </p>
            )}
          </div>
        )}
        {uploadedFile && (
          <div className="command-panel">
            <div className="command-mode">
              <label className="command-label" htmlFor="command-input">
                Tell DevGate how to run this document
              </label>
              <Radio.Group
                value={commandMode}
                onChange={(event) => setCommandMode(event.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="master">Use Master Prompt</Radio.Button>
                <Radio.Button value="custom">Write Custom Command</Radio.Button>
              </Radio.Group>
            </div>
            {commandMode === 'custom' ? (
              <TextArea
                id="command-input"
                rows={3}
                placeholder="Describe how you want the RAG agent to handle this PDF..."
                value={userCommand}
                onChange={(event) => setUserCommand(event.target.value)}
                allowClear
                disabled={isProcessing}
              />
            ) : (
              <p className="muted-text command-hint">
                DevGate will run your saved master prompt automatically for this file.
              </p>
            )}
            {uploadedFile && (commandMode  == 'master' || commandMode == 'custom') && (
              <div className="project-settings inline-settings">
                <div className="project-settings-grid">
                  <div className="project-field">
                    <span className="project-label">Developers Needed</span>
                    <Select
                      value={developerCount}
                      onChange={setDeveloperCount}
                      options={[1, 2, 3, 4, 5].map((value) => ({
                        value,
                        label: `${value} developer${value > 1 ? 's' : ''}`,
                      }))}
                      className="project-select"
                    />
                  </div>
                  <div className="project-field">
                    <span className="project-label">Estimated Budget (USD)</span>
                    <InputNumber
                      className="project-input"
                      min={0}
                      step={500}
                      value={projectBudget}
                      onChange={(value) => setProjectBudget(value ?? 0)}
                      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number((value ?? '').replace(/[^0-9.-]+/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}
            <Button
              type="primary"
              size="large"
              className="command-button"
              disabled={
                isProcessing || (commandMode === 'custom' && !userCommand.trim())
              }
              loading={isProcessing}
              onClick={() => {
                void processFileWithBackend(uploadedFile, userCommand, commandMode)
              }}
            >
              {commandMode === 'custom' ? 'Send Custom Command' : 'Run Master Prompt'}
            </Button>
          </div>
        )}

          </section>

          <section className="panel preview-panel">
            <div className="panel-header-row">
              <h2>2. Generated PDF & Export</h2>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                disabled={!pdfPreviewUrl && !reportUrl}
                loading={isProcessing}
                size="middle"
                onClick={() => {
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
                  } else if (reportUrl) {
                    window.open(reportUrl, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                Export PDF
              </Button>
            </div>

            <p className="muted-text">
              Preview the generated PDF from your backend. When you’re happy with the result, export and share it with your team.
            </p>

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

            <p className="muted-text processing-hint">
              {isProcessing
                ? 'Processing in progress…'
                : 'Upload a file, choose your settings, then run the master or custom command to generate a report.'}
            </p>

            {reportUrl && (
              <p className="muted-text hint-text">
                Report URL:{' '}
                <a href={reportUrl} target="_blank" rel="noreferrer">
                  {reportUrl}
                </a>
              </p>
            )}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
