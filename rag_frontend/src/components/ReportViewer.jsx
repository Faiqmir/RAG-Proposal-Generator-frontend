import React, { useState } from 'react';
import { Card, Button, Radio, Space, Typography, message, Spin } from 'antd';
import { 
  FileTextOutlined, 
  TableOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import html2pdf from 'html2pdf.js';
import MarkdownDisplay from './MarkdownDisplay';
import StructuredDataDisplay from './StructuredDataDisplay';
import CostingDisplay from './CostingDisplay';
import './ReportViewer.css';

const { Title, Text } = Typography;

function ReportViewer({ response, currency = 'USD' }) {
  const [view, setView] = useState('markdown'); // 'markdown' | 'structured'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) {
        message.error('Report content not found');
        return;
      }

      const opt = {
        margin: 10,
        filename: 'project-report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      message.success('PDF generated successfully!');
    } catch (error) {
      message.error('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadBackendPDF = async () => {
    if (!response.document_id) {
      message.error('No document ID available for download');
      return;
    }

    try {
      // TODO: Implement backend PDF download when available
      message.info('Backend PDF download will be available when backend provides PDF endpoint');
      
      // Future implementation:
      // const response = await fetch(`/reports/${documentId}.pdf`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'project-report.pdf';
      // a.click();
    } catch (error) {
      message.error('Failed to download PDF: ' + error.message);
    }
  };

  if (!response || !response.data) {
    return (
      <Card title="Report Generation">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Generating report...
          </Title>
        </div>
      </Card>
    );
  }

  return (
    <div className="report-viewer">
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              Project Report
            </Title>
            <Space>
              <Text type="secondary">
                Processing Time: {response.processing_time}s
              </Text>
            </Space>
          </div>
        }
        className="report-viewer-card"
      >
        {/* View Controls */}
        <div className="view-controls" style={{ marginBottom: 24 }}>
          <Space>
            <Radio.Group 
              value={view} 
              onChange={(e) => setView(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="markdown">
                <FileTextOutlined /> Markdown View
              </Radio.Button>
              <Radio.Button value="structured">
                <TableOutlined /> Structured Data
              </Radio.Button>
            </Radio.Group>
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={generatePDF}
              loading={isGeneratingPDF}
            >
              Generate PDF
            </Button>
            
            <Button 
              icon={<EyeOutlined />}
              onClick={downloadBackendPDF}
            >
              Download Backend PDF
            </Button>
          </Space>
        </div>

        {/* Report Content */}
        <div id="report-content" className="report-content">
          {view === 'markdown' && (
            <div>
              <Title level={4}>Markdown Report</Title>
              <MarkdownDisplay markdown={response.data.markdown || 'No markdown content available'} />
            </div>
          )}
          
          {view === 'structured' && (
            <div>
              <Title level={4}>Structured Data View</Title>
              {response.data.structured ? (
                <StructuredDataDisplay data={response.data.structured} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <EyeOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  <Title level={4} type="secondary">
                    No structured data available
                  </Title>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Costing Display */}
        {response.data.costing && (
          <CostingDisplay costing={response.data.costing} currency={currency} />
        )}

        {/* Metadata */}
        {response.data.metadata && (
          <Card 
            title="Report Metadata" 
            size="small" 
            style={{ marginTop: 24 }}
          >
            <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(response.data.metadata, null, 2)}
            </pre>
          </Card>
        )}
      </Card>
    </div>
  );
}

export default ReportViewer;
