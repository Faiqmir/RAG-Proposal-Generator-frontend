import React from 'react';
import { Card, Table, Typography, Statistic, Row, Col, Tag } from 'antd';
import { DollarOutlined, CalculatorOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function CostingDisplay({ costing, currency = 'USD' }) {
  const formatCurrency = (amount, currencyCode = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  const renderCostItems = () => {
    if (!costing.items || !Array.isArray(costing.items)) {
      return null;
    }

    const columns = [
      {
        title: 'Item',
        dataIndex: 'item',
        key: 'item',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (text) => <Text type="secondary">{text}</Text>,
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        render: (quantity) => (
          <Tag color="blue">{quantity}</Tag>
        ),
      },
      {
        title: 'Unit Cost',
        dataIndex: 'unit_cost',
        key: 'unit_cost',
        align: 'right',
        render: (cost) => formatCurrency(cost, currency),
      },
      {
        title: 'Total Cost',
        dataIndex: 'total_cost',
        key: 'total_cost',
        align: 'right',
        render: (cost) => (
          <Text strong style={{ color: '#1890ff' }}>
            {formatCurrency(cost, currency)}
          </Text>
        ),
      },
    ];

    const dataSource = costing.items.map((item, index) => ({
      key: index,
      item: item.name || item.item || 'Unknown Item',
      description: item.description || '-',
      quantity: item.quantity || 1,
      unit_cost: item.unit_cost || item.rate || 0,
      total_cost: item.total_cost || (item.unit_cost * item.quantity) || 0,
    }));

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="middle"
        className="costing-table"
        summary={(pageData) => {
          const total = pageData.reduce(
            (sum, record) => sum + record.total_cost,
            0
          );
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong>Total Estimated Cost:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                  {formatCurrency(total, currency)}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  };

  return (
    <div className="costing-display">
      <Card 
        title={
          <span>
            <CalculatorOutlined style={{ marginRight: 8 }} />
            Cost Analysis
          </span>
        }
        className="costing-card"
        style={{ marginTop: '24px' }}
      >
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Statistic
              title="Total Estimated Cost"
              value={costing.total_estimated_cost || 0}
              formatter={(value) => formatCurrency(value, currency)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Cost Items"
              value={costing.items?.length || 0}
              suffix="items"
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Currency"
              value={currency}
              valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
            />
          </Col>
        </Row>

        {costing.items && costing.items.length > 0 && (
          <div>
            <Title level={4}>Cost Breakdown</Title>
            {renderCostItems()}
          </div>
        )}

        {!costing.items && costing.total_estimated_cost && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Title level={3}>
              Total Cost: {formatCurrency(costing.total_estimated_cost, currency)}
            </Title>
            <Text type="secondary">
              Detailed breakdown not available
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}

export default CostingDisplay;
