import { DatePicker } from 'antd';
import dayjs from 'dayjs';

export function StayDateRangePicker({
  end,
  onChange,
  start,
}: {
  end: string;
  onChange: (start: string, end: string) => void;
  start: string;
}) {
  return (
    <div className="stays-date-range-picker">
      <DatePicker.RangePicker
        allowClear={false}
        format="DD/MM/YYYY"
        onChange={(values) => {
          onChange(values?.[0]?.format('YYYY-MM-DD') ?? '', values?.[1]?.format('YYYY-MM-DD') ?? '');
        }}
        placeholder={['Data inicial', 'Data final']}
        value={[dayjs(start), dayjs(end)]}
      />
    </div>
  );
}
