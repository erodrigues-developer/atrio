import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrlCurrencyInput, CnpjInput, CpfInput, PhoneInput } from './MaskedInput';

describe('MaskedInput', () => {
  it('formats Brazilian phone numbers and exposes only national digits', () => {
    const onValueChange = vi.fn();
    render(<label>Telefone<PhoneInput onValueChange={onValueChange} value="+5531999991234" /></label>);

    const input = screen.getByLabelText('Telefone');
    expect(input).toHaveValue('(31) 99999-1234');

    fireEvent.change(input, { target: { value: '(11) 98888-7777' } });
    expect(onValueChange).toHaveBeenLastCalledWith('11988887777');
  });

  it('formats CPF and CNPJ values', () => {
    render(
      <>
        <label>CPF<CpfInput value="12345678901" /></label>
        <label>CNPJ<CnpjInput value="12345678000199" /></label>
      </>,
    );

    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01');
    expect(screen.getByLabelText('CNPJ')).toHaveValue('12.345.678/0001-99');
  });

  it('formats BRL amounts and exposes their value in cents', () => {
    const onAmountChange = vi.fn();
    render(<label>Valor<BrlCurrencyInput amountCents={123_456} onAmountChange={onAmountChange} /></label>);

    const input = screen.getByLabelText('Valor');
    expect(input).toHaveValue('R$ 1.234,56');

    fireEvent.change(input, { target: { value: 'R$ 12,34' } });
    expect(onAmountChange).toHaveBeenLastCalledWith(1_234);
  });
});
