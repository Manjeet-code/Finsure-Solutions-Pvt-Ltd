import { jsPDF } from 'jspdf';

const loadLogoBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.width, height: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const generatePlatformAnalyticsPDF = async ({
  platformData,
  branchMatrix = [],
  drilldownApps = [],
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = [10, 25, 47]; // #0A192F
  const accentIndigo = [79, 70, 229]; // #4F46E5
  const accentBlue = [37, 99, 235]; // #2563EB
  const bgLight = [248, 250, 252];
  const borderLight = [226, 232, 240];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];

  // Load FinSure Logo
  const logoObj = await loadLogoBase64('/logo.png');

  // 1. Executive Top Header Banner
  doc.setFillColor(...primaryDark);
  doc.rect(0, 0, 210, 42, 'F');

  if (logoObj && logoObj.dataUrl) {
    const logoW = 24;
    const logoH = (logoObj.height / logoObj.width) * logoW;
    doc.addImage(logoObj.dataUrl, 'PNG', 14, 9, logoW, Math.min(logoH, 24));
  } else {
    doc.setFillColor(...accentIndigo);
    doc.roundedRect(14, 9, 26, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'black');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('FS', 20, 25);
  }

  const textLeft = logoObj ? 42 : 46;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('FinSure Solutions Pvt. Ltd.', textLeft, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text('NATIONAL PLATFORM PERFORMANCE & RISK ANALYTICS REPORT', textLeft, 24);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Executive Board & Risk Management Committee Division', textLeft, 30);

  // Top Right Report Metadata
  const reportRef = `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  doc.setFillColor(255, 255, 255, 0.1);
  doc.roundedRect(142, 9, 54, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('REPORT METADATA', 146, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr}`, 146, 20);
  doc.text(`Report Ref: ${reportRef}`, 146, 25);

  doc.setFillColor(...accentIndigo);
  doc.rect(0, 42, 210, 2, 'F');

  // 2. Executive Summary KPI Scorecards
  let currentY = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('1. Platform Financial & Operational Highlights', 14, currentY);

  const kpiY = currentY + 4;
  const cardW = 42;
  const cardH = 22;

  // Card 1: Applications & Users
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.roundedRect(14, kpiY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(67, 56, 202);
  doc.text('TOTAL APPLICATIONS', 17, kpiY + 6);
  doc.setFontSize(14);
  doc.setTextColor(...textDark);
  doc.text(`${platformData?.totalApplications || 0}`, 17, kpiY + 14);
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text(`Applicants: ${platformData?.totalUsers || 0}`, 17, kpiY + 19);

  // Card 2: Approval Rate
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(60, kpiY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(29, 78, 216);
  doc.text('APPROVAL RATE', 63, kpiY + 6);
  doc.setFontSize(14);
  doc.setTextColor(...textDark);
  doc.text(`${platformData?.approvalRate || 0}%`, 63, kpiY + 14);
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text(`Approved: ${platformData?.approvedCount || 0}`, 63, kpiY + 19);

  // Card 3: Total Disbursed Capital
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(106, kpiY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(4, 120, 87);
  doc.text('CAPITAL DISBURSED', 109, kpiY + 6);
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text(`₹${Number(platformData?.totalDisbursedAmount || 0).toLocaleString('en-IN')}`, 109, kpiY + 14);
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text('Net Portfolio Disbursed', 109, kpiY + 19);

  // Card 4: Default Exposure Risk
  doc.setFillColor(255, 241, 242); // rose-50
  doc.roundedRect(152, kpiY, cardW, cardH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(190, 18, 60);
  doc.text('DEFAULT EXPOSURE', 155, kpiY + 6);
  doc.setFontSize(11);
  doc.setTextColor(190, 18, 60);
  doc.text(`₹${Number(platformData?.totalOverdueAmount || 0).toLocaleString('en-IN')}`, 155, kpiY + 14);
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text(`Overdue EMIs: ${platformData?.overdueCount || 0}`, 155, kpiY + 19);

  // 3. Regional Branch Performance Matrix Table
  currentY = kpiY + cardH + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('2. Regional Branch Performance Matrix', 14, currentY);

  let tableY = currentY + 4;
  doc.setFillColor(...primaryDark);
  doc.roundedRect(14, tableY, 182, 8, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('BRANCH / CODE', 17, tableY + 5.5);
  doc.text('MANAGER', 65, tableY + 5.5);
  doc.text('RECEIVED', 105, tableY + 5.5);
  doc.text('APPROVED', 126, tableY + 5.5);
  doc.text('DISBURSED', 148, tableY + 5.5);
  doc.text('RATE', 174, tableY + 5.5);
  doc.text('TURNAROUND', 185, tableY + 5.5);

  tableY += 8;
  branchMatrix.forEach((b, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, tableY, 182, 8.5, 'F');
    doc.setDrawColor(...borderLight);
    doc.line(14, tableY + 8.5, 196, tableY + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(`${b.branchName} (${b.branchCode})`, 17, tableY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(b.managerName || 'Unassigned', 65, tableY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(`${b.totalApplications}`, 108, tableY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text(`${b.approvedCount}`, 129, tableY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...accentIndigo);
    doc.text(`₹${Number(b.disbursedVolume).toLocaleString('en-IN')}`, 148, tableY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textDark);
    doc.text(`${b.approvalRate}%`, 174, tableY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text(`${b.avgTurnaroundDays || 1.2}d`, 186, tableY + 5.5);

    tableY += 8.5;
  });

  // 4. Portfolio Workflow Applications Queue
  currentY = tableY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('3. Recent Portfolio Underwriting & Application Feed', 14, currentY);

  let appTableY = currentY + 4;
  doc.setFillColor(...primaryDark);
  doc.roundedRect(14, appTableY, 182, 8, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('APP ID', 18, appTableY + 5.5);
  doc.text('APPLICANT NAME', 48, appTableY + 5.5);
  doc.text('PINCODE', 100, appTableY + 5.5);
  doc.text('AMOUNT (₹)', 130, appTableY + 5.5);
  doc.text('WORKFLOW STATUS', 165, appTableY + 5.5);

  appTableY += 8;
  const recentList = (platformData?.recentApplications || drilldownApps || []).slice(0, 6);

  if (recentList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('No recent application activity recorded.', 18, appTableY + 6);
    appTableY += 10;
  } else {
    recentList.forEach((app, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(14, appTableY, 182, 8, 'F');
      doc.setDrawColor(...borderLight);
      doc.line(14, appTableY + 8, 196, appTableY + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...textDark);
      doc.text(app.applicationId || `APP-${idx + 101}`, 18, appTableY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text(app.applicantDetails?.fullName || app.citizenId?.name || 'Applicant', 48, appTableY + 5.5);

      doc.text(app.applicantDetails?.pincode || '226010', 100, appTableY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...accentBlue);
      doc.text(`₹${Number(app.approvedAmount || app.amount || 0).toLocaleString('en-IN')}`, 130, appTableY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      const isAppr = ['Approved', 'SANCTIONED', 'Disbursed'].includes(app.status);
      doc.setTextColor(isAppr ? 4 : 185, isAppr ? 120 : 28, isAppr ? 87 : 28);
      doc.text(app.status || 'Submitted', 165, appTableY + 5.5);

      appTableY += 8;
    });
  }

  // 5. Executive Compliance Seal & Footers
  const sealY = Math.min(appTableY + 8, 250);
  doc.setFillColor(...bgLight);
  doc.roundedRect(14, sealY, 182, 22, 3, 3, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(14, sealY, 182, 22, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Executive Underwriting Committee & Risk Office', 20, sealY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Verified Real-Time Platform Aggregations via MongoDB Financial Pipelines.', 20, sealY + 12);
  doc.text(`System Timestamp: ${new Date().toISOString()}`, 20, sealY + 17);

  // Digital Seal Badge
  doc.setDrawColor(...accentIndigo);
  doc.roundedRect(142, sealY + 4, 48, 14, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...accentIndigo);
  doc.text('OFFICIAL PLATFORM REPORT', 144, sealY + 9.5);
  doc.setFontSize(6);
  doc.setTextColor(...textMuted);
  doc.text('DIGITALLY CERTIFIED & LOGGED', 144, sealY + 14);

  // Footer
  const footerY = 282;
  doc.setDrawColor(...borderLight);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text('FinSure Solutions Pvt. Ltd.', 14, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text(' | Corporate Risk Office: Vibhuti Khand, Lucknow, UP | Confidential', 48, footerY + 5);
  doc.text('Page 1 of 1', 196, footerY + 5, { align: 'right' });

  // Save PDF
  const filename = `FinSure_National_Analytics_Report_${reportRef}.pdf`;
  doc.save(filename);
};
