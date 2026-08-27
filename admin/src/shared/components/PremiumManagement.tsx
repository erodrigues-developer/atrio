import { type ReactNode } from 'react';
import { Pagination as AntPagination, Select as AntSelect, Typography } from 'antd';

export function ManagementEmptyState({
  actions,
  alt,
  description,
  image,
  title,
}: {
  actions: ReactNode;
  alt: string;
  description: string;
  image: string;
  title: string;
}) {
  return (
    <div className="premium-empty-state">
      <img alt={alt} src={image} />
      <Typography.Title level={3}>{title}</Typography.Title>
      <p>{description}</p>
      <div className="empty-state-actions">{actions}</div>
    </div>
  );
}

export function ManagementPagination({
  currentPage,
  onPageChange,
  pageSize = 10,
  totalItems,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems: number;
}) {
  return (
    <footer className="pagination-bar">
      <div className="pagination-size">
        <span>Itens por página</span>
        <AntSelect options={[{ label: String(pageSize), value: pageSize }]} value={pageSize} />
      </div>
      <AntPagination current={currentPage} disabled={totalItems === 0} onChange={onPageChange} pageSize={pageSize} showSizeChanger={false} total={Math.max(totalItems, 1)} />
    </footer>
  );
}
