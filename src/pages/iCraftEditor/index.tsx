import React, { useEffect, useState } from 'react';
import { Layout} from 'antd';
import ICraftPlayer from '@icraft/player'

ICraftPlayer.defineConfig({
  fontUrl: "https://icraft.gantcloud.com/api/static/font/AlibabaPuHuiTi-3-85-Bold.ttf",
});

const { Content } = Layout;
const EDITOR_BASE_URL = "https://icraft.gantcloud.com/editor";
// 默认场景配置
const defaultScene = {
  background: {
    color: '#f0f0f0',
    type: 'color'
  },
  camera: {
    position: [0, 0, 5] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    fov: 60
  },
  lights: [
    {
      type: 'ambient',
      intensity: 0.5
    },
    {
      type: 'directional',
      position: [5, 5, 5] as [number, number, number],
      intensity: 1
    }
  ],
  objects: [
    {
      type: 'mesh',
      geometry: {
        type: 'box',
        width: 1,
        height: 1,
        depth: 1
      },
      material: {
        color: '#1890ff'
      }
    }
  ]
};

const Workflow3DEditor: React.FC = () => {
  const [scene, setScene] = useState(defaultScene);
  const [isPlaying, setIsPlaying] = useState(false);


  const params = new URLSearchParams({
    url: "https://icraft.gantcloud.com/api/static/templates/ArgoCD.icraft",
    preview: "true",
    defaultAnimationPlan: "0",
    autoPlay: "true",
    loop: "true",
  });

  const src = `${EDITOR_BASE_URL}?${params.toString()}`;

  return (
    <Layout style={{ minHeight: 'calc(100vh - 70px)' }}>
      <Content style={{ background: '#fff' }}>
        {/*<div id="container"></div>*/}
        <iframe
          src={src}
          title='iCraft Editor'
          width='100%'
          height='100%'
          style={{ border: "none" }}
          allowFullScreen
        />
      </Content>
    </Layout>
  );
};

export default Workflow3DEditor;
