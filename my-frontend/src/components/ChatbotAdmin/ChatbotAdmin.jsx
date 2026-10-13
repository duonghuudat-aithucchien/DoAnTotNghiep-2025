import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Card, Col, Descriptions, Row, Space, Spin, Statistic, Typography } from 'antd';
import { chatRequest } from '../../service/ChatbotService';
export default function ChatbotAdmin() {
  const user = useSelector((state) => state.user);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (signal) => {
    setLoading(true); setError('');
    try { const data = await chatRequest('/api/admin/metrics', user, { signal }); if (!signal?.aborted) setResult(data); }
    catch (err) { if (!signal?.aborted) setError(err.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [user]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  const reindex = async () => {
    setReindexing(true); setError('');
    try { await chatRequest('/api/admin/reindex', user, { method: 'POST' }); await load(); }
    catch (err) { setError(err.message); }
    finally { setReindexing(false); }
  };
  const data = result?.data || {};
  const index = result?.retrieval || {};
  return <div style={{ padding: 24 }}>
    <Typography.Title level={2}>AI Assistant · Theo dõi vận hành</Typography.Title>
    <Typography.Paragraph type="secondary">Dữ liệu 7 ngày gần nhất, tối đa 1.000 lượt. Chỉ số vận hành không thay thế bộ đánh giá chất lượng câu trả lời.</Typography.Paragraph>
    <Space style={{ marginBottom: 16 }}><Button loading={loading} onClick={() => load()}>Làm mới</Button><Button loading={reindexing} disabled={loading} onClick={reindex}>Cập nhật chỉ mục sản phẩm</Button></Space>
    {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>{[
        ['Lượt xử lý', data.sample_count || 0], ['Độ trễ p50 (ms)', data.p50_ms || 0], ['Độ trễ p95 (ms)', data.p95_ms || 0],
        ['Fallback (%)', ((data.fallback_rate || 0) * 100).toFixed(1)], ['Không có sản phẩm (%)', ((data.no_result_rate || 0) * 100).toFixed(1)],
        ['Token đầu vào', data.prompt_tokens || 0], ['Token đầu ra', data.output_tokens || 0], ['Hữu ích / Chưa hữu ích', `${data.positive_feedback || 0} / ${data.negative_feedback || 0}`], ['Lượt mở sản phẩm', data.product_clicks || 0],
      ].map(([title, value]) => <Col xs={24} sm={12} lg={8} key={title}><Card><Statistic title={title} value={value} /></Card></Col>)}</Row>
      <Card title="Chỉ mục truy hồi" style={{ marginTop: 16 }}><Descriptions column={2} items={[
        { key: 'state', label: 'Trạng thái', children: index.indexed ? 'Đã lập chỉ mục' : 'Chưa khởi tạo' },
        { key: 'mode', label: 'Dense retrieval', children: index.dense_available ? 'Khả dụng' : 'Chưa tải / đang dùng BM25' },
        { key: 'size', label: 'Sản phẩm', children: index.catalog_size || 0 },
        { key: 'revision', label: 'Fingerprint', children: index.fingerprint || '—' },
        { key: 'ttl', label: 'Kiểm tra thay đổi', children: `${index.refresh_seconds || 60} giây` },
      ]} /></Card>
      <Alert style={{ marginTop: 16 }} type="info" showIcon message="Lần đầu có thể mất thời gian để tải model. Giá và tồn kho được kiểm tra bằng dữ liệu hiện tại; chatbot không tự thanh toán hoặc hoàn tiền." />
    </Spin>
  </div>;
}
