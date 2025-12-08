import React from 'react';
import { Card, Table, Typography, Divider } from 'antd';

const { Title, Paragraph, Text } = Typography;

function StructuredDataDisplay({ data }) {
  const formatSectionTitle = (key) => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderContent = (content) => {
    if (typeof content === 'string') {
      // Check if it's a markdown table
      if (content.includes('|') && content.includes('-')) {
        return renderMarkdownTable(content);
      }
      return <Paragraph>{content}</Paragraph>;
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index}>
          {renderContent(item)}
          {index < content.length - 1 && <Divider />}
        </div>
      ));
    }
    
    if (typeof content === 'object' && content !== null) {
      return (
        <div>
          {Object.entries(content).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <Title level={4}>{formatSectionTitle(key)}</Title>
              {renderContent(value)}
            </div>
          ))}
        </div>
      );
    }
    
    return <Text>{String(content)}</Text>;
  };

  const renderMarkdownTable = (markdownTable) => {
    // Parse markdown table
    const lines = markdownTable.trim().split('\n');
    const headerLine = lines[0];
    const separatorLine = lines[1];
    const dataLines = lines.slice(2);

    // Parse headers
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    
    // Parse data rows
    const dataSource = dataLines.map((line, index) => {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      const rowData = {};
      headers.forEach((header, headerIndex) => {
        rowData[header] = cells[headerIndex] || '';
      });
      return {
        key: index,
        ...rowData
      };
    }).filter(row => Object.values(row).some(val => val));

    const columns = headers.map(header => ({
      title: header,
      dataIndex: header,
      key: header,
      render: (text) => text || '-'
    }));

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="middle"
        className="professional-table"
        style={{ marginTop: '16px' }}
      />
    );
  };

  return (
    <div className="structured-view">
      <Card title={data.title || 'Project Report'} className="report-card">
        {data.sections ? (
          Object.entries(data.sections).map(([key, value]) => (
            <div key={key} className="section" style={{ marginBottom: '24px' }}>
              <Title level={3}>{formatSectionTitle(key)}</Title>
              {renderContent(value)}
            </div>
          ))
        ) : (
          <div>No structured sections available</div>
        )}
      </Card>
    </div>
  );
}

export default StructuredDataDisplay;
