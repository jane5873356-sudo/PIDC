import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { INITIAL_QUOTATIONS } from '../src/data/standardData';
import { calculateQuotationCost, calculateTieredPricing } from '../src/utils/costCalculator';

async function generateSamplePptx() {
  const quote = INITIAL_QUOTATIONS[0]; // 車用雷達防水感測器外蓋
  const pptx = new pptxgen();
  const cost = calculateQuotationCost(quote);
  const tiers = calculateTieredPricing(quote);

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '久揚塑膠股份有限公司 JIOU YANG PLASTIC';
  pptx.company = '久揚塑膠股份有限公司';
  pptx.title = `${quote.quoteNumber} - ${quote.product.partName} 成本報價簡報`;

  const C_NAVY = '0F172A';
  const C_BLUE = '1E40AF';
  const C_ACCENT = '2563EB';
  const C_SLATE = '475569';
  const C_LIGHT = 'F8FAFC';
  const C_WHITE = 'FFFFFF';
  const C_EMERALD = '059669';
  const C_AMBER = 'D97706';

  // SLIDE 1
  const s1 = pptx.addSlide();
  s1.background = { color: C_NAVY };
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.25, fill: { color: C_ACCENT } });
  s1.addText('久揚塑膠股份有限公司 ｜ JIOU YANG PLASTIC CO., LTD.', { x: 1.0, y: 1.5, w: 11.3, h: 0.5, fontSize: 16, color: '94A3B8', bold: true });
  s1.addText('塑膠射出零件成本核算與正式報價簡報', { x: 1.0, y: 2.1, w: 11.3, h: 1.0, fontSize: 34, color: C_WHITE, bold: true });
  s1.addText(`專案品名：${quote.product.partName}\n客戶料號：${quote.product.partNumber} ｜ 客戶名稱：${quote.client.name}`, { x: 1.0, y: 3.2, w: 11.3, h: 0.9, fontSize: 20, color: '60A5FA', bold: true });
  s1.addShape(pptx.ShapeType.roundRect, { x: 1.0, y: 4.8, w: 11.3, h: 1.6, fill: { color: '1E293B' }, line: { color: '334155', width: 1 }, rectRadius: 0.1 });
  s1.addText(
    [
      { text: `報價單號：${quote.quoteNumber} (版本: ${quote.version})\n`, options: { bold: true, color: C_WHITE } },
      { text: `報價日期：${quote.createdAt.slice(0, 10)} ｜ 詢價批量：${quote.commercial.orderQuantity.toLocaleString()} 件\n`, options: { color: 'CBD5E1' } },
      { text: `建議單價：NT$ ${cost.suggestedUnitPrice.toFixed(2)} / 件 ｜ 目標毛利率：${quote.commercial.targetGrossMarginPct}%\n`, options: { color: '34D399', bold: true } },
      { text: `承辦業務：${quote.createdBy} ｜ 審核主管：${quote.approval?.reviewedBy || '林建興 廠長'}`, options: { color: '94A3B8' } },
    ],
    { x: 1.3, y: 5.0, w: 10.7, h: 1.2, fontSize: 13, lineSpacing: 22 }
  );

  // SLIDE 2
  const s2 = pptx.addSlide();
  s2.background = { color: C_LIGHT };
  s2.addText('01. 產品規格與工程圖面', { x: 0.8, y: 0.45, w: 10.0, h: 0.45, fontSize: 20, bold: true, color: C_NAVY });
  s2.addText('Product Specifications & Engineering Drawings', { x: 0.8, y: 0.9, w: 10.0, h: 0.3, fontSize: 11, color: '64748B' });

  const specRows = [
    [{ text: '規格項目', options: { bold: true, fill: { color: 'E2E8F0' }, color: C_NAVY } }, { text: '規格參數說明', options: { bold: true, fill: { color: 'E2E8F0' }, color: C_NAVY } }],
    [{ text: '產品品名', options: { bold: true } }, { text: quote.product.partName }],
    [{ text: '客戶料號', options: { bold: true } }, { text: quote.product.partNumber }],
    [{ text: '外觀尺寸', options: { bold: true } }, { text: quote.product.dimensionsMm || '依 3D 圖面標記' }],
    [{ text: '公差等級', options: { bold: true } }, { text: quote.product.toleranceGrade }],
    [{ text: '外觀處理', options: { bold: true } }, { text: quote.product.surfaceFinish }],
    [{ text: '成品單重', options: { bold: true } }, { text: `${quote.material.partWeightG} g (成品淨重)` }],
    [{ text: '料頭分攤', options: { bold: true } }, { text: `${(quote.material.runnerWeightG / Math.max(1, quote.molding.cavities)).toFixed(2)} g / 件` }],
  ];
  s2.addTable(specRows, { x: 0.8, y: 1.6, w: 11.7, h: 4.8, fontSize: 12, rowH: 0.55, border: { pt: 0.5, color: 'CBD5E1' } });

  // SLIDE 3
  const s3 = pptx.addSlide();
  s3.background = { color: C_LIGHT };
  s3.addText('02. 材料成本精確核算', { x: 0.8, y: 0.45, w: 10.0, h: 0.45, fontSize: 20, bold: true, color: C_NAVY });
  const matFormulaRows = [
    [{ text: '工程參數項目', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '數值設定', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '工程說明與計算邏輯', options: { bold: true, fill: { color: 'E2E8F0' } } }],
    [{ text: '塑膠原料型號' }, { text: `${quote.material.materialName} (${quote.material.materialGrade})` }, { text: `原料單價 NT$ ${quote.material.materialPricePerKg}/kg` }],
    [{ text: '單件總分攤料重' }, { text: `${cost.grossMaterialWeightPerPartG} g` }, { text: `成品 ${quote.material.partWeightG}g + 料頭分攤` }],
    [{ text: '回收次料混用比' }, { text: `${quote.material.regrindRatioPct}%` }, { text: `次料折價損失比率 ${quote.material.regrindDiscountPct}%，線上粉碎回用` }],
    [{ text: '材料損耗率與良率' }, { text: `損耗 ${quote.material.materialLossRatePct}% / 良率 ${quote.molding.yieldRatePct}%` }, { text: '烘料揮發與不良品均攤' }],
    [{ text: '單件材料總成本', options: { bold: true } }, { text: `NT$ ${cost.materialCostPerPart.toFixed(2)}`, options: { bold: true, color: C_EMERALD } }, { text: '加權綜合單件材料支出' }],
  ];
  s3.addTable(matFormulaRows, { x: 0.8, y: 1.6, w: 11.7, h: 4.8, fontSize: 12, rowH: 0.6, border: { pt: 0.5, color: 'CBD5E1' } });

  // SLIDE 4
  const s4 = pptx.addSlide();
  s4.background = { color: C_LIGHT };
  s4.addText('03. 成本結構與建議報價', { x: 0.8, y: 0.45, w: 10.0, h: 0.45, fontSize: 20, bold: true, color: C_NAVY });
  const summaryRows = [
    [{ text: '成本項目分類', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '單件金額 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '成本占比 (%)', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '整批總支出 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' } } }],
    [{ text: '1. 材料成本' }, { text: `NT$ ${cost.materialCostPerPart.toFixed(2)}` }, { text: `${Math.round((cost.materialCostPerPart / cost.totalUnitCost) * 100)}%` }, { text: `NT$ ${(cost.materialCostPerPart * quote.commercial.orderQuantity).toLocaleString()}` }],
    [{ text: '2. 成型加工費' }, { text: `NT$ ${cost.moldingCostPerPart.toFixed(2)}` }, { text: `${Math.round((cost.moldingCostPerPart / cost.totalUnitCost) * 100)}%` }, { text: `NT$ ${(cost.moldingCostPerPart * quote.commercial.orderQuantity).toLocaleString()}` }],
    [{ text: '3. 換模調機分攤' }, { text: `NT$ ${cost.setupCostPerPart.toFixed(2)}` }, { text: `${Math.round((cost.setupCostPerPart / cost.totalUnitCost) * 100)}%` }, { text: `NT$ ${cost.totalSetupBatchCost.toLocaleString()}` }],
    [{ text: '4. 後加工包運費' }, { text: `NT$ ${cost.postProcessCostPerPart.toFixed(2)}` }, { text: `${Math.round((cost.postProcessCostPerPart / cost.totalUnitCost) * 100)}%` }, { text: `NT$ ${(cost.postProcessCostPerPart * quote.commercial.orderQuantity).toLocaleString()}` }],
    [{ text: '5. 廠務管理費' }, { text: `NT$ ${cost.managementExpensePerPart.toFixed(2)}` }, { text: `${Math.round((cost.managementExpensePerPart / cost.totalUnitCost) * 100)}%` }, { text: `NT$ ${(cost.managementExpensePerPart * quote.commercial.orderQuantity).toLocaleString()}` }],
    [{ text: '★ 單件總成本', options: { bold: true } }, { text: `NT$ ${cost.totalUnitCost.toFixed(2)}`, options: { bold: true } }, { text: '100%' }, { text: `NT$ ${(cost.totalUnitCost * quote.commercial.orderQuantity).toLocaleString()}`, options: { bold: true } }],
    [{ text: '★ 建議單件報價', options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE } }, { text: `NT$ ${cost.suggestedUnitPrice.toFixed(2)}`, options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE } }, { text: `毛利 ${quote.commercial.targetGrossMarginPct}%`, options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE } }, { text: `總營業額 NT$ ${cost.batchTotalRevenue.toLocaleString()}`, options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE } }],
  ];
  s4.addTable(summaryRows, { x: 0.8, y: 1.6, w: 11.7, h: 4.8, fontSize: 12, rowH: 0.5, border: { pt: 0.5, color: 'CBD5E1' } });

  // SLIDE 5
  const s5 = pptx.addSlide();
  s5.background = { color: C_LIGHT };
  s5.addText('04. 多批量階梯報價方案 (Tiered Pricing Matrix)', { x: 0.8, y: 0.45, w: 10.0, h: 0.45, fontSize: 20, bold: true, color: C_NAVY });
  const tierRows = [
    [{ text: '訂購批量 (件)', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '換模分攤', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '單件成本', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '建議單件報價', options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE } }, { text: '毛利率', options: { bold: true, fill: { color: 'E2E8F0' } } }, { text: '整批訂單總額', options: { bold: true, fill: { color: 'E2E8F0' } } }],
    ...tiers.map(t => [
      { text: `${t.quantity.toLocaleString()} 件` },
      { text: `NT$ ${t.setupCost.toFixed(2)}` },
      { text: `NT$ ${t.totalCost.toFixed(2)}` },
      { text: `NT$ ${t.suggestedPrice.toFixed(2)}`, options: { bold: true, color: C_BLUE } },
      { text: `${t.grossMarginPct}%`, options: { color: C_EMERALD } },
      { text: `NT$ ${t.totalRevenue.toLocaleString()}` },
    ]),
  ];
  s5.addTable(tierRows, { x: 0.8, y: 1.6, w: 11.7, h: 4.8, fontSize: 12, rowH: 0.6, border: { pt: 0.5, color: 'CBD5E1' } });

  // SLIDE 6
  const s6 = pptx.addSlide();
  s6.background = { color: C_NAVY };
  s6.addText('久揚塑膠股份有限公司', { x: 1.0, y: 2.2, w: 11.3, h: 0.6, fontSize: 22, color: '94A3B8', bold: true });
  s6.addText('感謝您的信任與合作 期待攜手量產', { x: 1.0, y: 2.8, w: 11.3, h: 1.0, fontSize: 36, color: C_WHITE, bold: true });
  s6.addText('地址：桃園市龜山區工四路 28 號 ｜ 電話：(03) 328-8899\n承辦專案經理：王建宏 ｜ 審核主管：林建興 廠長', { x: 1.0, y: 4.5, w: 11.3, h: 1.2, fontSize: 14, color: '94A3B8', lineSpacing: 22 });

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPath = path.join(publicDir, '久揚塑膠_射出零件成本報價簡報_JY-2026-Q084.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log('Sample PPTX generated at:', outPath);
}

generateSamplePptx();
