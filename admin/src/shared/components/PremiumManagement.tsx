import { type KeyboardEvent, type ReactNode } from 'react';
import { Pagination as AntPagination, Select as AntSelect, Spin, Typography } from 'antd';

export function MobileRecordList({
  children,
  emptyContent,
  hasItems,
  isLoading,
}: {
  children: ReactNode;
  emptyContent: ReactNode;
  hasItems: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="mobile-record-list">
      {isLoading ? <div className="mobile-record-loading"><Spin /><span>Carregando registros...</span></div> : null}
      {!isLoading && !hasItems ? <div className="mobile-record-empty">{emptyContent}</div> : null}
      {!isLoading && hasItems ? children : null}
    </div>
  );
}

export function MobileRecordCard({
  actions,
  badge,
  children,
  image,
  onSelect,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  image?: ReactNode;
  onSelect?: () => void;
  subtitle?: ReactNode;
  title: ReactNode;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      className={`mobile-record-card${onSelect ? ' selectable' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <header className="mobile-record-header">
        {image ? <div className="mobile-record-image">{image}</div> : null}
        <div className="mobile-record-heading"><strong>{title}</strong>{subtitle ? <span>{subtitle}</span> : null}</div>
        {badge ? <div className="mobile-record-badge">{badge}</div> : null}
      </header>
      <div className="mobile-record-fields">{children}</div>
      {actions ? <footer className="mobile-record-actions" onClick={(event) => event.stopPropagation()}>{actions}</footer> : null}
    </article>
  );
}

export function MobileRecordField({ label, value }: { label: string; value: ReactNode }) {
  return <div className="mobile-record-field"><span>{label}</span><strong>{value}</strong></div>;
}

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
