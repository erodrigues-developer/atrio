import { forwardRef } from 'react';
import { Input, type InputProps, type InputRef } from 'antd';
import { NumberFormatBase, NumericFormat, PatternFormat } from 'react-number-format';

type MaskedTextInputProps = Omit<InputProps, 'defaultValue' | 'onChange' | 'type' | 'value'> & {
  onValueChange?: (value: string) => void;
  value?: string;
};

type BrlCurrencyInputProps = Omit<InputProps, 'addonBefore' | 'defaultValue' | 'onChange' | 'prefix' | 'suffix' | 'type' | 'value'> & {
  amountCents: number;
  onAmountChange: (amountCents: number) => void;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function nationalPhoneDigits(value: string) {
  const digits = onlyDigits(value);
  return digits.length > 11 && digits.startsWith('55') ? digits.slice(2, 13) : digits.slice(0, 11);
}

function formatBrazilianPhone(value: string) {
  const digits = nationalPhoneDigits(value);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  if (subscriber.length <= 4) return `(${areaCode}) ${subscriber}`;

  const prefixLength = digits.length === 11 ? 5 : 4;
  return `(${areaCode}) ${subscriber.slice(0, prefixLength)}-${subscriber.slice(prefixLength)}`;
}

export const PhoneInput = forwardRef<InputRef, MaskedTextInputProps>(function PhoneInput(
  { onValueChange, value = '', ...inputProps },
  ref,
) {
  return (
    <NumberFormatBase
      {...inputProps}
      customInput={Input}
      format={formatBrazilianPhone}
      getInputRef={ref}
      inputMode="tel"
      isAllowed={({ value: digits }) => digits.length <= 11}
      onValueChange={({ value: digits }) => onValueChange?.(digits)}
      removeFormatting={nationalPhoneDigits}
      value={nationalPhoneDigits(value)}
      valueIsNumericString
    />
  );
});

export const CpfInput = forwardRef<InputRef, MaskedTextInputProps>(function CpfInput(
  { onValueChange, value = '', ...inputProps },
  ref,
) {
  return (
    <PatternFormat
      {...inputProps}
      customInput={Input}
      format="###.###.###-##"
      getInputRef={ref}
      inputMode="numeric"
      onValueChange={({ value: digits }) => onValueChange?.(digits)}
      value={onlyDigits(value).slice(0, 11)}
      valueIsNumericString
    />
  );
});

export const CnpjInput = forwardRef<InputRef, MaskedTextInputProps>(function CnpjInput(
  { onValueChange, value = '', ...inputProps },
  ref,
) {
  return (
    <PatternFormat
      {...inputProps}
      customInput={Input}
      format="##.###.###/####-##"
      getInputRef={ref}
      inputMode="numeric"
      onValueChange={({ value: digits }) => onValueChange?.(digits)}
      value={onlyDigits(value).slice(0, 14)}
      valueIsNumericString
    />
  );
});

export const BrlCurrencyInput = forwardRef<InputRef, BrlCurrencyInputProps>(function BrlCurrencyInput(
  { amountCents, onAmountChange, ...inputProps },
  ref,
) {
  return (
    <NumericFormat
      {...inputProps}
      allowNegative={false}
      customInput={Input}
      decimalScale={2}
      decimalSeparator=","
      fixedDecimalScale
      getInputRef={ref}
      inputMode="decimal"
      onValueChange={({ floatValue }) => onAmountChange(Math.round((floatValue ?? 0) * 100))}
      placeholder="0,00"
      prefix="R$ "
      thousandSeparator="."
      value={amountCents / 100}
    />
  );
});
