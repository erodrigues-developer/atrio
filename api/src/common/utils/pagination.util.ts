export type PaginationResult<T> = {
  items: T[];
  pagination: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
};

export function decodeCursor(cursor?: string): number {
  if (!cursor) {
    return 0;
  }

  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8')) as {
      offset?: number;
    };

    return typeof decoded.offset === 'number' && decoded.offset >= 0 ? decoded.offset : 0;
  } catch (_error) {
    return 0;
  }
}

export function encodeCursor(offset: number): string {
  return Buffer.from(JSON.stringify({ offset }), 'utf-8').toString('base64');
}

export function paginateItems<T>(
  items: T[],
  limit = items.length,
  cursor?: string,
): PaginationResult<T> {
  const offset = decodeCursor(cursor);
  const nextOffset = offset + limit;
  const pageItems = items.slice(offset, nextOffset);

  return {
    items: pageItems,
    pagination: {
      hasNextPage: nextOffset < items.length,
      nextCursor: nextOffset < items.length ? encodeCursor(nextOffset) : null,
    },
  };
}
