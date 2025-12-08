import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Upload, Button, Progress, Input, Radio, Select, InputNumber, Card, Form, Divider, Alert, Tooltip, Switch, Steps, Badge, Space, Typography } from 'antd'
import { InboxOutlined, SettingOutlined, InfoCircleOutlined, DollarOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ArrowRightOutlined, StarOutlined } from '@ant-design/icons'
import 'antd/dist/reset.css'
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const { Dragger } = Upload
const { TextArea } = Input
const { Step } = Steps
const { Text } = Typography

function UploadPage({ onSubmit, isProcessing }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [userCommand, setUserCommand] = useState('')
  const [mode, setMode] = useState('master')
  const [developmentScope, setDevelopmentScope] = useState('local')
  const [currency, setCurrency] = useState('PKR')
  const [projectType, setProjectType] = useState('web_app')
  const [technicalResourceRate, setTechnicalResourceRate] = useState('')
  const [nonTechnicalResourceRate, setNonTechnicalResourceRate] = useState('')
  const [projectTimeline, setProjectTimeline] = useState('')
  const [fixedBudget, setFixedBudget] = useState('')
  const [resourcesNeeded, setResourcesNeeded] = useState('')
  const [inputMode, setInputMode] = useState('text') // Default to text
  const [textInput, setTextInput] = useState('')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [completedFields, setCompletedFields] = useState(new Set())

  // Debounce refs
  const debounceTimeoutRef = useRef(null)

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

  // Calculate completion progress - memoized for performance
  const progress = useMemo(() => {
    const requiredFields = []
    const completed = []

    // Check input completion
    if (inputMode === 'file' && uploadedFile) {
      completed.push('file')
      requiredFields.push('file')
    } else if (inputMode === 'text' && textInput.trim()) {
      completed.push('text')
      requiredFields.push('text')
    }

    // Check rates
    if (technicalResourceRate) completed.push('tech_rate')
    if (nonTechnicalResourceRate) completed.push('non_tech_rate')
    requiredFields.push('tech_rate', 'non_tech_rate')

    // Check optional fields
    const optionalFields = []
    if (projectTimeline) optionalFields.push('timeline')
    if (fixedBudget) optionalFields.push('budget')
    if (resourcesNeeded) optionalFields.push('resources')

    return {
      required: requiredFields.length,
      completed: completed.length,
      optional: optionalFields.length,
      total: requiredFields.length + optionalFields.length
    }
  }, [inputMode, uploadedFile, textInput, technicalResourceRate, nonTechnicalResourceRate, projectTimeline, fixedBudget, resourcesNeeded])

  const progressPercentage = useMemo(() => {
    return progress.required > 0 ? Math.round((progress.completed / progress.required) * 100) : 0
  }, [progress])

  // Update step based on progress
  useEffect(() => {
    if (progressPercentage === 0) setCurrentStep(0)
    else if (progressPercentage < 50) setCurrentStep(1)
    else if (progressPercentage < 100) setCurrentStep(2)
    else setCurrentStep(3)
  }, [progressPercentage])

  // Debounced text input handler
  const debouncedTextInputChange = useCallback((value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setTextInput(value)
    }, 150) // 150ms debounce
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.pdf,.txt',
    beforeUpload: (file) => {
      setUploadedFile(file)
      setTextInput('')
      return false
    },
    onRemove: () => {
      setUploadedFile(null)
      setUserCommand('')
      setMode('master')
      return true
    },
    onDrop: (e) => {
      setIsDragging(false)
    },
    onDragEnter: () => {
      setIsDragging(true)
    },
    onDragLeave: () => {
      setIsDragging(false)
    },
  }

  const handleSubmit = () => {
    // Clear previous error messages
    setErrorMessage('')
    
    // Validate input
    if (inputMode === 'file' && !uploadedFile) {
      setErrorMessage('Please upload a PDF or TXT file before submitting.')
      return
    }

    if (inputMode === 'text' && !textInput.trim()) {
      setErrorMessage('Please enter your requirements in the text box.')
      return
    }

    if (!technicalResourceRate || !nonTechnicalResourceRate) {
      setErrorMessage('Please provide both technical and non-technical hourly rates')
      return
    }

    // Create form data for API submission
    const formData = new FormData()
    
    // Add file or text content
    if (inputMode === 'file') {
      formData.append('file', uploadedFile)
    } else {
      formData.append('text_content', textInput || '')
    }
    
    // Add processing parameters
    formData.append('input_mode', inputMode || 'text')
    formData.append('instruction', userCommand || '')
    formData.append('mode', mode || 'master')
    formData.append('development_scope', developmentScope || 'local')
    formData.append('currency', currency || 'PKR')
    formData.append('project_type', projectType || 'web_app')
    formData.append('technical_hourly_rate', technicalResourceRate?.toString() || '')
    formData.append('non_technical_hourly_rate', nonTechnicalResourceRate?.toString() || '')
    
    // Add optional parameters
    if (projectTimeline) {
      formData.append('timeline_weeks', projectTimeline.toString())
    }
    if (fixedBudget) {
      formData.append('fixed_budget', fixedBudget.toString())
    }
    if (resourcesNeeded) {
      formData.append('resources_needed', resourcesNeeded.toString())
    }

    onSubmit(formData)
  }

  return (
    <div className="upload-page-container">
      <Card 
        title={
          <Space>
            <StarOutlined style={{ color: '#1890ff' }} />
            <span>Document Processing</span>
            <Badge count={progressPercentage} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        } 
        className="upload-panel interactive-panel"
      >
        {/* Progress Steps */}
        <div className="progress-steps">
          <Steps current={currentStep} size="small">
            <Step title="Input" icon={<InboxOutlined />} />
            <Step title="Settings" icon={<SettingOutlined />} />
            <Step title="Options" icon={<StarOutlined />} />
            <Step title="Ready" icon={<CheckCircleOutlined />} />
          </Steps>
          <div className="progress-bar">
            <Progress 
              percent={progressPercentage} 
              status={progressPercentage === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#52c41a',
              }}
              showInfo={false}
            />
            <Text type="secondary">{progressPercentage}% Complete</Text>
          </div>
        </div>

        <Divider />

        {/* Interactive Input Section */}
        <div className={`input-section ${isDragging ? 'dragging' : ''}`}>
          <div className="section-header">
            <Space>
              <Badge 
                status={uploadedFile || textInput.trim() ? 'success' : 'processing'} 
                text={uploadedFile || textInput.trim() ? 'Input Ready' : 'Input Required'}
              />
              <ArrowRightOutlined />
            </Space>
          </div>

          <h2>1. Choose Input Method</h2>
          <p className="muted-text">Upload a file or enter your requirements directly.</p>
          
          {/* Enhanced Input Mode Toggle */}
          <div className="input-mode-toggle">
            <Radio.Group
              value={inputMode}
              onChange={(e) => {
                setInputMode(e.target.value)
                setUploadedFile(null)
                setTextInput('')
                setErrorMessage('')
              }}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="file">
                <InboxOutlined /> Upload File
              </Radio.Button>
              <Radio.Button value="text">
                <StarOutlined /> Enter Text
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Enhanced File Upload Area */}
          {inputMode === 'file' && (
            <div className="upload-area">
              <Dragger {...uploadProps} className={`interactive-dragger ${isDragging ? 'drag-active' : ''}`}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: isDragging ? '#1890ff' : '#40a9ff' }} />
                </p>
                <p className="ant-upload-text">
                  {isDragging ? 'Drop your file here!' : 'Click or drag a PDF/TXT file to this area'}
                </p>
                <p className="ant-upload-hint">
                  The file will be processed to generate a comprehensive report.
                </p>
                {uploadedFile && (
                  <div className="file-success">
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <span className="selected-file">{uploadedFile.name}</span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  </div>
                )}
              </Dragger>
            </div>
          )}

          {/* Enhanced Text Input Area */}
          {inputMode === 'text' && (
            <div className="text-input-area">
              <div className="input-header">
                <Space>
                  <Badge 
                    status={textInput.trim() ? 'success' : 'default'} 
                    text={textInput.trim() ? 'Text Ready' : 'Enter Requirements'}
                  />
                  <Text type="secondary">{textInput.length} characters</Text>
                </Space>
              </div>
              <TextArea
                rows={6}
                placeholder="Enter your project requirements, specifications, or any text content you want to generate a report from..."
                value={textInput}
                onChange={(e) => debouncedTextInputChange(e.target.value)}
                allowClear
                disabled={isProcessing}
                className="interactive-textarea"
              />
              <p className="muted-text">
                Describe your project requirements in detail. The AI will generate a comprehensive report based on your input.
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert 
            message="Error" 
            description={errorMessage} 
            type="error" 
            showIcon 
            style={{ marginTop: '20px' }}
          />
        )}

        {/* Processing Options */}
        {(uploadedFile || (inputMode === 'text' && textInput.trim())) && (
          <>
            <Divider />
            
            <div className="processing-options">
              <h3>Processing Options</h3>
              
              <div className="option-group">
                <label className="option-label">Processing Mode</label>
                <Radio.Group
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="master">Master Mode</Radio.Button>
                  <Radio.Button value="mvp">MVP Mode</Radio.Button>
                </Radio.Group>
                <p className="muted-text">
                  {mode === 'master' 
                    ? 'Generate a comprehensive report with detailed analysis and costing.'
                    : 'Generate a streamlined report focusing on essential features and implementation.'}
                </p>
              </div>
              
              {mode === 'custom' && (
                <div className="option-group">
                  <label className="option-label">Custom Instructions</label>
                  <TextArea
                    rows={3}
                    placeholder="Describe how you want the AI to process your document..."
                    value={userCommand}
                    onChange={(event) => setUserCommand(event.target.value)}
                    allowClear
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>
            
            <Divider />
            
            {/* Project Settings */}
            <div className="project-settings">
              <h3>Project Settings</h3>
              
              <div className="settings-content">
                <div className="settings-grid">
                  <div className="setting-field">
                    <label className="setting-label">Development Scope</label>
                    <Select
                      value={developmentScope}
                      onChange={setDevelopmentScope}
                      options={[
                        { value: 'local', label: 'Local team' },
                        { value: 'international', label: 'International team' },
                      ]}
                      className="setting-select"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Currency</label>
                    <Select
                      value={currency}
                      onChange={setCurrency}
                      options={[
                        { value: 'PKR', label: 'PKR' },
                        { value: 'USD', label: 'USD' },
                        { value: 'EUR', label: 'EUR' },
                      ]}
                      className="setting-select"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Project Type</label>
                    <Select
                      value={projectType}
                      onChange={setProjectType}
                      options={[
                        { value: 'web_app', label: 'Web App' },
                        { value: 'android_app', label: 'Android App' },
                        { value: 'ios_app', label: 'iOS App' },
                        { value: 'backend_api', label: 'Backend API' },
                        { value: 'desktop_app', label: 'Desktop App' },
                        { value: 'data_pipeline', label: 'Data Pipeline' },
                      ]}
                      className="setting-select"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Non-Technical Rate ({currency}) *</label>
                    <InputNumber
                      className="setting-input"
                      min={0}
                      step={currency === 'PKR' ? 1000 : 10}
                      value={nonTechnicalResourceRate}
                      onChange={(value) => setNonTechnicalResourceRate(value ?? '')}
                      formatter={(value) =>
                        value ? formatCurrency(value, currency) : ''
                      }
                      parser={(value) =>
                        Number((value ?? '').replace(/[^0-9.-]+/g, '')) || ''
                      }
                      placeholder="Enter hourly rate"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Technical Rate ({currency}) *</label>
                    <InputNumber
                      className="setting-input"
                      min={0}
                      step={currency === 'PKR' ? 1000 : 10}
                      value={technicalResourceRate}
                      onChange={(value) => setTechnicalResourceRate(value ?? '')}
                      formatter={(value) =>
                        value ? formatCurrency(value, currency) : ''
                      }
                      parser={(value) =>
                        Number((value ?? '').replace(/[^0-9.-]+/g, '')) || ''
                      }
                      placeholder="Enter hourly rate"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Timeline (weeks)</label>
                    <InputNumber
                      className="setting-input"
                      min={0}
                      step={1}
                      value={projectTimeline}
                      onChange={(value) => setProjectTimeline(value ?? '')}
                      placeholder="Optional - leave empty for estimation"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Fixed Budget ({currency})</label>
                    <InputNumber
                      className="setting-input"
                      min={0}
                      step={currency === 'PKR' ? 10000 : 500}
                      value={fixedBudget}
                      onChange={(value) => setFixedBudget(value ?? '')}
                      formatter={(value) =>
                        value ? formatCurrency(value, currency) : ''
                      }
                      parser={(value) =>
                        Number((value ?? '').replace(/[^0-9.-]+/g, '')) || ''
                      }
                      placeholder="Optional - leave empty if not fixed"
                    />
                  </div>
                  <div className="setting-field">
                    <label className="setting-label">Resources Needed</label>
                    <InputNumber
                      className="setting-input"
                      min={0}
                      step={1}
                      value={resourcesNeeded}
                      onChange={(value) => setResourcesNeeded(value ?? '')}
                      placeholder="Optional - leave empty for estimation"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <Button
              type="primary"
              size="large"
              className="submit-button"
              disabled={
                isProcessing || 
                !technicalResourceRate || 
                !nonTechnicalResourceRate ||
                (inputMode === 'file' && !uploadedFile) ||
                (inputMode === 'text' && !textInput.trim())
              }
              loading={isProcessing}
              onClick={handleSubmit}
            >
              Generate Report
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}

export default UploadPage