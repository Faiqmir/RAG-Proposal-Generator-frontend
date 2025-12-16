import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ReportGenerationPage from '../components/ReportGenerationPage'
import { useChatContext } from '../context/ChatContext'

const ReportPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { resetChat } = useChatContext()

    const { reportData, documentId, costing, currency } = location.state || {}

    const handleStartNewChat = () => {
        resetChat()
        navigate('/')
    }



    if (!reportData) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    textAlign: 'center'
                }}>
                    <h2>No Report Data Available</h2>
                    <p>Please generate a report first.</p>
                    <Button type="primary" onClick={() => navigate('/')}>
                        Start New Chat
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Your Generated Report</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                            Document ID: {documentId}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>

                        <Button
                            type="primary"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleStartNewChat}
                        >
                            Start New Chat
                        </Button>
                    </div>
                </div>

                <ReportGenerationPage
                    pdfPreviewUrl={null}
                    reportUrl={''}
                    reportData={reportData}
                    isProcessing={false}
                    costing={costing}
                    currency={currency}
                    uploadedFile={null}
                    inputMode="text"
                    errorMessage={''}
                />
            </div>
        </div>
    )
}

export default ReportPage
