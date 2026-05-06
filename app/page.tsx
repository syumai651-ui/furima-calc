'use client';

import { useState, useMemo } from 'react';

const PLATFORMS = [
  { name: 'メルカリ', rate: '10' },
  { name: 'ラクマ',   rate: '6.6' },
  { name: 'ヤフオク', rate: '8.8' },
  { name: 'PayPay',   rate: '5' },
];

function fmt(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(Math.round(Math.abs(value)));
}

function InputField({
  label, value, onChange, placeholder, unit, unitPosition = 'left', hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; unit: string; unitPosition?: 'left' | 'right'; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {unitPosition === 'left' && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">{unit}</span>
        )}
        <input
          type="number" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '0'} min="0"
          className={`w-full py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800
            text-right text-lg font-semibold transition-all duration-150
            focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100
            placeholder:text-gray-300
            ${unitPosition === 'left' ? 'pl-8 pr-4' : 'pl-4 pr-8'}`}
        />
        {unitPosition === 'right' && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">{unit}</span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1 ml-1">{hint}</p>}
    </div>
  );
}

function BreakdownRow({
  label, value, color = 'gray', bold = false, large = false, prefix = '',
}: {
  label: string; value: number; color?: 'gray'|'red'|'green'|'orange';
  bold?: boolean; large?: boolean; prefix?: string;
}) {
  const colorClass = { gray:'text-gray-700', red:'text-rose-500', green:'text-emerald-600', orange:'text-orange-500' }[color];
  return (
    <div className={`flex justify-between items-center ${large ? 'pt-3' : ''}`}>
      <span className={`${bold?'font-bold':'font-medium'} text-sm ${large?'text-base':''} text-gray-600`}>{label}</span>
      <span className={`${colorClass} ${bold?'font-bold':'font-semibold'} ${large?'text-2xl':'text-base'}`}>
        {prefix}¥{fmt(value)}
      </span>
    </div>
  );
}

export default function Page() {
  const [sellingPrice,  setSellingPrice]  = useState('');
  const [feeRate,       setFeeRate]       = useState('10');
  const [shippingCost,  setShippingCost]  = useState('');
  const [packagingCost, setPackagingCost] = useState('');

  const calc = useMemo(() => {
    const price    = Math.max(0, parseFloat(sellingPrice)  || 0);
    const rate     = Math.max(0, parseFloat(feeRate)       || 0);
    const shipping = Math.max(0, parseFloat(shippingCost)  || 0);
    const packing  = Math.max(0, parseFloat(packagingCost) || 0);
    const feeAmt    = Math.floor(price * rate / 100);
    const totalCost = feeAmt + shipping + packing;
    const profit    = price - totalCost;
    const profitRate = price > 0 ? (profit / price) * 100 : 0;
    return { price, rate, feeAmt, shipping, packing, totalCost, profit, profitRate };
  }, [sellingPrice, feeRate, shippingCost, packagingCost]);

  const hasPrice    = calc.price > 0;
  const isProfit    = calc.profit >= 0;
  const isBreakEven = calc.profit === 0;

  const handleReset = () => {
    setSellingPrice(''); setFeeRate('10'); setShippingCost(''); setPackagingCost('');
  };

  const resultStyle = !hasPrice
    ? { bg:'bg-gray-50',      border:'border-gray-200',    text:'text-gray-300',    badge:'bg-gray-100 text-gray-400' }
    : isProfit
    ? { bg:'bg-emerald-50',   border:'border-emerald-200', text:'text-emerald-600', badge:'bg-emerald-100 text-emerald-700' }
    : { bg:'bg-rose-50',      border:'border-rose-200',    text:'text-rose-500',    badge:'bg-rose-100 text-rose-600' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <main className="max-w-md mx-auto px-4 py-8 pb-16">

        {/* ヘッダー */}
        <header className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-md mb-3">
            <span className="text-3xl">🏷️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">フリマ利益計算機</h1>
          <p className="text-gray-500 text-sm mt-1">メルカリ・ラクマなどの利益をかんたん計算</p>
        </header>

        {/* 結果カード */}
        <div className={`rounded-2xl border-2 ${resultStyle.bg} ${resultStyle.border} p-6 mb-5 text-center transition-all duration-300`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">販売利益</p>
          <p className={`text-6xl font-black mb-1 transition-colors duration-300 ${resultStyle.text}`}>
            {hasPrice ? `${isProfit ? '' : '−'}¥${fmt(calc.profit)}` : '---'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {hasPrice && !isBreakEven ? (isProfit ? 'この金額が手元に残ります' : 'この金額が赤字になります') : ' '}
          </p>
          <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${resultStyle.badge} transition-all duration-300`}>
            <span className="text-sm font-semibold">利益率</span>
            <span className="text-xl font-black">
              {hasPrice ? `${calc.profitRate.toFixed(1)}%` : '--.---%'}
            </span>
          </div>
        </div>

        {/* 入力カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">入力項目</h2>
            <button onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
              ↺ リセット
            </button>
          </div>
          <div className="space-y-4">
            <InputField label="販売価格" value={sellingPrice} onChange={setSellingPrice} unit="¥" placeholder="例: 3000" />
            <div>
              <InputField
                label="販売手数料" value={feeRate} onChange={setFeeRate}
                unit="%" unitPosition="right"
                hint={calc.price > 0 ? `→ ¥${fmt(calc.feeAmt)} が差し引かれます` : undefined}
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {PLATFORMS.map(({ name, rate }) => (
                  <button key={name} onClick={() => setFeeRate(rate)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      feeRate === rate ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <InputField label="配送料"    value={shippingCost}  onChange={setShippingCost}  unit="¥" placeholder="例: 385" />
            <InputField label="梱包資材費" value={packagingCost} onChange={setPackagingCost} unit="¥" placeholder="例: 50" />
          </div>
        </div>

        {/* 内訳カード */}
        {hasPrice && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">内訳</h2>
            <div className="space-y-2.5">
              <BreakdownRow label="販売価格"                       value={calc.price}    color="gray" />
              <BreakdownRow label={`販売手数料（${calc.rate}%）`}  value={calc.feeAmt}   color="red"    prefix="− " />
              {calc.shipping > 0 && <BreakdownRow label="配送料"    value={calc.shipping} color="red"    prefix="− " />}
              {calc.packing  > 0 && <BreakdownRow label="梱包資材費" value={calc.packing}  color="red"    prefix="− " />}
              <div className="border-t-2 border-dashed border-gray-100 my-2" />
              <BreakdownRow label="合計コスト" value={calc.totalCost} color="orange" bold />
              <div className="border-t-2 border-gray-100 my-1" />
              <BreakdownRow
                label={isProfit ? '手元に残る利益' : '赤字（損失）'}
                value={calc.profit}
                color={isProfit ? 'green' : 'red'}
                bold large
                prefix={isProfit ? '' : '− '}
              />
            </div>
          </div>
        )}

        {/* 免責事項 */}
        <footer className="mt-8 px-2">
          <div className="border border-gray-200 rounded-xl p-4 bg-white/60">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              このアプリを使用して発生したいかなる不利益も、<br />
              開発者は責任を負いません。<br />
              計算結果は目安としてご利用ください。
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
