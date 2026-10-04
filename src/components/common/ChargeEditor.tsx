'use client';
import { ChargeConfig } from '../../types';

export const fieldClass = 'w-full rounded-xl border border-surface-container bg-white px-3 py-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none';

export function ChargeEditor({ value, onChange }: { value: ChargeConfig; onChange: (value: ChargeConfig) => void }) {
  const set = (key: keyof ChargeConfig, next: string | number) => onChange({ ...value, [key]: next });
  return <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="field-label">Brokerage per executed order (₹)
        <input className={fieldClass} type="number" min="0" step="0.01" required value={value.brokeragePerOrder} onChange={e => set('brokeragePerOrder', Number(e.target.value))} />
      </label>
      <label className="field-label">Brokerage method
        <select className={fieldClass} value={value.brokerageMode} onChange={e => set('brokerageMode', e.target.value)}>
          <option value="flat">Flat per order</option><option value="capped">Lower of % or per-order cap</option>
        </select>
      </label>
      {value.brokerageMode === 'capped' && <label className="field-label">Turnover brokerage (%) · except options
        <input className={fieldClass} type="number" min="0" step="0.001" required value={value.brokeragePercent} onChange={e => set('brokeragePercent', Number(e.target.value))} />
      </label>}
      <label className="field-label">Exchange
        <select className={fieldClass} value={value.exchange} onChange={e => set('exchange', e.target.value)}><option>NSE</option><option>BSE</option></select>
      </label>
      <label className="field-label">Delivery brokerage per order (₹)
        <input className={fieldClass} type="number" min="0" step="0.01" required value={value.deliveryBrokeragePerOrder} onChange={e => set('deliveryBrokeragePerOrder', Number(e.target.value))} />
      </label>
    </div>
    <details className="rounded-xl border border-surface-container p-3">
      <summary className="cursor-pointer text-sm font-medium">GST, DP and other charges</summary>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <label className="field-label">GST (%)<input className={fieldClass} type="number" min="0" step="0.01" required value={value.gstPercent} onChange={e => set('gstPercent', Number(e.target.value))} /></label>
        <label className="field-label">Delivery DP fee incl. GST (₹)<input className={fieldClass} type="number" min="0" step="0.01" required value={value.dpCharge} onChange={e => set('dpCharge', Number(e.target.value))} /></label>
        <label className="field-label">Other fees per trade (₹)<input className={fieldClass} type="number" min="0" step="0.01" required value={value.otherCharges} onChange={e => set('otherCharges', Number(e.target.value))} /></label>
      </div>
    </details>
    <p className="text-xs leading-relaxed text-on-surface-variant">One buy + one sell uses two executed orders. Taxes depend on turnover and segment. Additional fills within an order do not create another order.</p>
  </div>;
}
