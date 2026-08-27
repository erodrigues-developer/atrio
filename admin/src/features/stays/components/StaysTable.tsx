import { ReactNode, useState } from 'react';
import { Button, Pagination as AntPagination, Select as AntSelect, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import staysEmptyImage from '@/assets/stays-empty.png';
import { type AdminStay } from '../api';
import { Modal } from '@/shared/components/Modal';
import {
  formatStayDate, shortStayStatus, stayStatusColor, stayWorkflowConfirmLabel,
  stayWorkflowMessage, stayWorkflowTitle,
} from '@/shared/lib/presentation';

export function StaysEmptyState({ onClearFilters, onCreate }: { onClearFilters: () => void; onCreate: () => void }) {
  return (
    <div className="stays-empty-state">
      <img alt="Porta de hotel com uma mala" src={staysEmptyImage} />
      <Typography.Title level={3}>Nenhuma estadia encontrada</Typography.Title>
      <p>Tente ajustar os filtros ou crie uma nova estadia para começar.</p>
      <div className="empty-state-actions">
        <Button onClick={onClearFilters}>Limpar filtros</Button>
        <Button icon={<PlusOutlined />} onClick={onCreate} type="primary">Nova estadia</Button>
      </div>
    </div>
  );
}

export function Pagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
}) {
  return (
    <footer className="pagination-bar">
      <div className="pagination-size">
        <span>Itens por página</span>
        <AntSelect options={[{ label: '10', value: 10 }]} value={pageSize} />
      </div>
      <AntPagination current={currentPage} disabled={totalItems === 0} onChange={onPageChange} pageSize={pageSize} showSizeChanger={false} total={Math.max(totalItems, 1)} />
    </footer>
  );
}

export function StaysTable({
  emptyContent,
  isLoading,
  stays,
  onCancel,
  onSelect,
  onResend,
}: {
  emptyContent: ReactNode;
  isLoading: boolean;
  stays: AdminStay[];
  onCancel: (stay: AdminStay) => void;
  onSelect: (stay: AdminStay) => void;
  onResend: (stay: AdminStay) => void;
}) {
  const [workflowCandidate, setWorkflowCandidate] = useState<{ action: 'resend' | 'cancel'; stay: AdminStay } | null>(null);

  const columns = [
    { title: 'Quarto', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: 'Hóspede', key: 'guest', render: (_: unknown, stay: AdminStay) => `${stay.guest.firstName} ${stay.guest.lastName}` },
    { title: 'Check-in', dataIndex: 'checkInDate', key: 'checkInDate', render: (value: string) => formatStayDate(value) },
    { title: 'Check-out', dataIndex: 'checkOutDate', key: 'checkOutDate', render: (value: string) => formatStayDate(value) },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color={stayStatusColor(value)}>{shortStayStatus(value)}</Tag> },
    { title: 'Nº acessos ao App', key: 'app', align: 'center' as const, render: (_: unknown, stay: AdminStay) => stay.activeGuestSessions },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: unknown, stay: AdminStay) => (
        <div className="stay-table-actions" onClick={(event) => event.stopPropagation()}>
          <Button aria-label="Ver detalhes" icon={<EyeOutlined />} onClick={() => onSelect(stay)} title="Ver detalhes" type="text" />
          <Button aria-label="Reenviar acesso" disabled={!['scheduled', 'active'].includes(stay.status)} icon={<SendOutlined />} onClick={() => setWorkflowCandidate({ action: 'resend', stay })} title="Reenviar acesso" type="text" />
          <Button aria-label="Cancelar estadia" danger disabled={stay.status !== 'scheduled'} icon={<DeleteOutlined />} onClick={() => setWorkflowCandidate({ action: 'cancel', stay })} title="Cancelar estadia" type="text" />
        </div>
      ),
    },
  ];

  return (
    <>
    <Table className="stays-table" columns={columns} dataSource={stays} loading={isLoading} locale={{ emptyText: emptyContent }} onRow={(stay) => ({ onClick: () => onSelect(stay) })} pagination={false} rowClassName="clickable-row" rowKey="id" />
    {workflowCandidate ? (
      <Modal title={stayWorkflowTitle(workflowCandidate.action)} onClose={() => setWorkflowCandidate(null)} size="compact">
        <p className="muted-text">
          {stayWorkflowMessage(workflowCandidate.action, workflowCandidate.stay)}
        </p>
        <div className="modal-footer">
          <Button onClick={() => setWorkflowCandidate(null)}>Cancelar</Button>
          <Button
            danger={workflowCandidate.action === 'cancel'}
            onClick={() => {
              if (workflowCandidate.action === 'resend') {
                onResend(workflowCandidate.stay);
              } else {
                onCancel(workflowCandidate.stay);
              }
              setWorkflowCandidate(null);
            }}
            type="primary"
          >
            {stayWorkflowConfirmLabel(workflowCandidate.action)}
          </Button>
        </div>
      </Modal>
    ) : null}
    </>
  );
}
