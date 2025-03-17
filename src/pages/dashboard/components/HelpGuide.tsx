import React from 'react';
import { Modal, Collapse, Typography, Space, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

interface HelpGuideProps {
  visible: boolean;
  onClose: () => void;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ visible, onClose }) => {
  return (
    <Modal
      title="使用指南"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Typography>
        <Paragraph>
          欢迎使用 Dify 应用性能分析仪表板。本指南将帮助您了解各项功能和指标的含义。
        </Paragraph>

        <Alert
          message="快速开始"
          description="选择时间范围和时间粒度，查看您感兴趣的性能指标。您可以导出数据或生成PDF报告以便进一步分析。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Collapse defaultActiveKey={['1']}>
          <Panel header="性能指标解读" key="1">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>响应时间</Title>
              <Paragraph>
                <Text strong>定义：</Text> API请求的平均响应时间。
                <br />
                <Text strong>最佳实践：</Text>
                <ul>
                  <li>保持在500ms以下为良好</li>
                  <li>超过1s需要优化</li>
                  <li>定期监控趋势变化</li>
                </ul>
              </Paragraph>

              <Title level={5}>请求量</Title>
              <Paragraph>
                <Text strong>定义：</Text> API调用的总次数。
                <br />
                <Text strong>注意事项：</Text>
                <ul>
                  <li>关注高峰期的请求分布</li>
                  <li>监控异常的请求量变化</li>
                  <li>评估系统容量是否充足</li>
                </ul>
              </Paragraph>

              <Title level={5}>错误率</Title>
              <Paragraph>
                <Text strong>定义：</Text> 失败请求占总请求的比例。
                <br />
                <Text strong>建议阈值：</Text>
                <ul>
                  <li>正常：&lt; 0.1%</li>
                  <li>警告：0.1% - 1%</li>
                  <li>严重：&gt; 1%</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>

          <Panel header="成本分析指标" key="2">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>总成本</Title>
              <Paragraph>
                <Text strong>包含：</Text>
                <ul>
                  <li>API调用费用</li>
                  <li>模型使用费用</li>
                  <li>存储费用</li>
                </ul>
              </Paragraph>

              <Title level={5}>成本优化建议</Title>
              <Paragraph>
                <ul>
                  <li>使用缓存减少重复请求</li>
                  <li>选择合适的模型规格</li>
                  <li>优化提示词减少token消耗</li>
                  <li>设置合理的预算告警</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>

          <Panel header="模型性能分析" key="3">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>关键指标</Title>
              <Paragraph>
                <ul>
                  <li>响应时间：模型生成回复的速度</li>
                  <li>成功率：请求成功完成的比例</li>
                  <li>质量评分：基于用户反馈的综合评分</li>
                </ul>
              </Paragraph>

              <Title level={5}>模型选择建议</Title>
              <Paragraph>
                <ul>
                  <li>根据任务复杂度选择合适的模型</li>
                  <li>考虑成本效益比</li>
                  <li>关注用户反馈</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>

          <Panel header="会话分析" key="4">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>会话指标</Title>
              <Paragraph>
                <ul>
                  <li>平均会话时长：用户交互的持续时间</li>
                  <li>消息数：每个会话的平均消息数</li>
                  <li>完成率：成功完成目标的会话比例</li>
                  <li>用户满意度：基于反馈的评分</li>
                </ul>
              </Paragraph>

              <Title level={5}>改善建议</Title>
              <Paragraph>
                <ul>
                  <li>优化首次响应时间</li>
                  <li>提供清晰的引导和提示</li>
                  <li>持续收集用户反馈</li>
                  <li>定期分析中断会话原因</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>

          <Panel header="告警管理" key="5">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>告警级别</Title>
              <Paragraph>
                <ul>
                  <li>信息：提示性消息，无需立即处理</li>
                  <li>警告：需要关注的异常情况</li>
                  <li>严重：需要立即处理的问题</li>
                </ul>
              </Paragraph>

              <Title level={5}>最佳实践</Title>
              <Paragraph>
                <ul>
                  <li>设置合理的告警阈值</li>
                  <li>配置告警通知方式</li>
                  <li>定期审查告警规则</li>
                  <li>建立告警响应流程</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>

          <Panel header="数据导出和报告" key="6">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>导出格式</Title>
              <Paragraph>
                <ul>
                  <li>CSV：适合数据分析和处理</li>
                  <li>Excel：适合查看和简单分析</li>
                  <li>PDF报告：适合分享和存档</li>
                </ul>
              </Paragraph>

              <Title level={5}>使用建议</Title>
              <Paragraph>
                <ul>
                  <li>定期导出数据备份</li>
                  <li>选择合适的时间范围</li>
                  <li>包含必要的上下文信息</li>
                  <li>注意数据安全性</li>
                </ul>
              </Paragraph>
            </Space>
          </Panel>
        </Collapse>

        <Alert
          message="需要帮助？"
          description="如果您有任何问题或需要技术支持，请联系我们的支持团队。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Typography>
    </Modal>
  );
};

export default HelpGuide; 