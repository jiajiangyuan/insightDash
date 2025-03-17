import React from 'react';
import { List, Card, Button, Tag, Space, Modal, Tooltip } from 'antd';
import { WorkflowTemplate } from '../types';

interface Version {
  id: string;
  version: string;
  description: string;
  createdAt: string;
  createdBy: string;
  workflow: WorkflowTemplate;
}

interface VersionHistoryProps {
  visible: boolean;
  onClose: () => void;
  onRestore: (version: Version) => void;
  currentVersion: string;
}

const mockVersions: Version[] = [
  {
    id: 'v1',
    version: '1.0.0',
    description: '初始版本',
    createdAt: '2024-03-20T10:00:00Z',
    createdBy: '张三',
    workflow: {} as WorkflowTemplate,
  },
  {
    id: 'v2',
    version: '1.0.1',
    description: '添加情感分析功能',
    createdAt: '2024-03-21T14:30:00Z',
    createdBy: '李四',
    workflow: {} as WorkflowTemplate,
  },
  {
    id: 'v3',
    version: '1.1.0',
    description: '优化数据处理流程',
    createdAt: '2024-03-22T09:15:00Z',
    createdBy: '王五',
    workflow: {} as WorkflowTemplate,
  },
];

const VersionHistory: React.FC<VersionHistoryProps> = ({
  visible,
  onClose,
  onRestore,
  currentVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = React.useState<Version | null>(null);
  const [restoreModalVisible, setRestoreModalVisible] = React.useState(false);

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion);
      setRestoreModalVisible(false);
      onClose();
    }
  };

  return (
    <>
      <Modal
        title="版本历史"
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        <List
          dataSource={mockVersions}
          renderItem={(version) => (
            <List.Item>
              <Card
                style={{ width: '100%' }}
                title={
                  <Space>
                    <span>版本 {version.version}</span>
                    {version.version === currentVersion && (
                      <Tag color="blue">当前版本</Tag>
                    )}
                  </Space>
                }
                extra={
                  <Space>
                    <Tooltip title="查看差异">
                      <Button type="text">对比</Button>
                    </Tooltip>
                    <Button
                      type="link"
                      disabled={version.version === currentVersion}
                      onClick={() => {
                        setSelectedVersion(version);
                        setRestoreModalVisible(true);
                      }}
                    >
                      还原到此版本
                    </Button>
                  </Space>
                }
              >
                <p>{version.description}</p>
                <Space split="•">
                  <span>创建人: {version.createdBy}</span>
                  <span>
                    创建时间: {new Date(version.createdAt).toLocaleString()}
                  </span>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title="还原版本"
        open={restoreModalVisible}
        onOk={handleRestore}
        onCancel={() => setRestoreModalVisible(false)}
      >
        <p>
          确定要还原到版本 {selectedVersion?.version} 吗？
          这将覆盖当前的工作流程。
        </p>
      </Modal>
    </>
  );
};

export default VersionHistory; 