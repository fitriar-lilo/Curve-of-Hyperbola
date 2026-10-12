import { jsPDF } from 'jspdf';
import { Question, UserAnswerState } from '../types';

interface ExportReportParams {
  studentName: string;
  score: number;
  answers: Record<string, UserAnswerState>;
  questions: Question[];
  reflection: string;
}

/**
 * Generates and downloads an actual PDF file using jsPDF
 */
export function downloadPdfReport({
  studentName,
  score,
  answers,
  questions,
  reflection,
}: ExportReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const name = studentName.trim() || 'Student';
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quadScore = questions
    .filter((q) => q.section === 'quadratic')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const hypScore = questions
    .filter((q) => q.section === 'hyperbola')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const totalAttempts = Object.values(answers).reduce((acc, curr) => acc + (curr.attempts || 0), 0);
  const answeredCount = Object.values(answers).filter((a) => a.attempts > 0).length;
  const avgAttempts = answeredCount > 0 ? (totalAttempts / answeredCount).toFixed(1) : '1.0';

  let masteryTitle = 'Needs More Practice';
  let badgeColor = [225, 29, 72]; // Rose
  if (score >= 13 && parseFloat(avgAttempts) <= 1.6) {
    masteryTitle = 'Hyperbola Master';
    badgeColor = [16, 185, 129]; // Emerald
  } else if (score >= 9) {
    masteryTitle = 'On the Right Track';
    badgeColor = [99, 102, 241]; // Indigo
  }

  // Header Banner
  doc.setFillColor(30, 27, 75); // Deep Indigo
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(199, 210, 254);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CAMBRIDGE IGCSE MATHEMATICS (0580) • OFFICIAL MASTERY REPORT', 14, 10);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Curved Graphs: Hyperbolas & Quadratics Portfolio', 14, 19);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${name}   |   Date: ${currentDate}   |   Total Score: ${score}/15 (${Math.round((score / 15) * 100)}%)`, 14, 26);

  // Score Summary Cards
  const cardY = 38;
  // Card 1: Overall
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, cardY, 56, 22, 2, 2, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL SCORE', 18, cardY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(`${score} / 15`, 18, cardY + 15);
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text(`${Math.round((score / 15) * 100)}% Accuracy`, 38, cardY + 15);

  // Card 2: Breakdown
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(75, cardY, 56, 22, 2, 2, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SECTION BREAKDOWN', 79, cardY + 6);
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Warm-up (Quadratics): ${quadScore} / 5`, 79, cardY + 12);
  doc.text(`Assessment (Hyperbolas): ${hypScore} / 10`, 79, cardY + 17);

  // Card 3: Mastery Level
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(136, cardY, 60, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTERY LEVEL', 140, cardY + 6);
  doc.setFontSize(13);
  doc.text(masteryTitle, 140, cardY + 14);
  doc.setFontSize(8);
  doc.text(`Avg. Attempts: ${avgAttempts}`, 140, cardY + 19);

  // Table of Question Attempts
  const tableY = 66;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Itemized Question & Attempt Tracking Log', 14, tableY);

  // Table Header
  doc.setFillColor(51, 65, 85);
  doc.rect(14, tableY + 3, 182, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('#', 17, tableY + 7.5);
  doc.text('Question Title', 26, tableY + 7.5);
  doc.text('Concept', 86, tableY + 7.5);
  doc.text('Status', 136, tableY + 7.5);
  doc.text('Attempts', 160, tableY + 7.5);
  doc.text('Hints', 182, tableY + 7.5);

  let currentY = tableY + 10;
  questions.forEach((q, index) => {
    const ans = answers[q.id];
    const isCorrect = ans?.isCorrect ?? false;
    const attempts = ans?.attempts ?? 0;
    const hints = ans?.revealedHints ?? 0;

    let concept = 'Quadratic Parabolas';
    if (q.id === 'hyp-6' || q.id === 'hyp-7' || q.id === 'hyp-8') concept = 'Graph to Equation';
    if (q.id === 'hyp-9' || q.id === 'hyp-10' || q.id === 'hyp-11') concept = 'Equation to Graph';
    if (q.id === 'hyp-12' || q.id === 'hyp-13') concept = 'Asymptote (y = b)';
    if (q.id === 'hyp-14' || q.id === 'hyp-15') concept = 'Sign of a & Quadrants';

    // Zebra striping
    if (attempts >= 3) {
      doc.setFillColor(254, 243, 199); // Highlight amber
      doc.rect(14, currentY, 182, 5.5, 'F');
    } else if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 5.5, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${q.number}`, 17, currentY + 4);

    doc.setTextColor(15, 23, 42);
    const titleSnippet = q.title.length > 36 ? q.title.substring(0, 36) + '...' : q.title;
    doc.text(titleSnippet, 26, currentY + 4);

    doc.setTextColor(71, 85, 105);
    doc.text(concept, 86, currentY + 4);

    if (isCorrect) {
      doc.setTextColor(16, 185, 129);
      doc.text('Solved', 136, currentY + 4);
    } else if (attempts > 0) {
      doc.setTextColor(217, 119, 6);
      doc.text('In Progress', 136, currentY + 4);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('Unanswered', 136, currentY + 4);
    }

    if (attempts >= 3) {
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${attempts} *`, 164, currentY + 4);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(51, 65, 85);
      doc.text(`${attempts}`, 164, currentY + 4);
    }

    doc.setTextColor(71, 85, 105);
    doc.text(`${hints}`, 184, currentY + 4);

    currentY += 5.5;
  });

  // Teacher Recommendations
  const recY = currentY + 5;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Feedback & Review Guidance', 14, recY);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, recY + 3, 182, 22, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('• When a > 0, hyperbola branches sit in Quadrants 1 & 3. When a < 0, branches sit in Quadrants 2 & 4.', 18, recY + 8);
  doc.text('• The horizontal line y = b is the asymptote that the curve approaches as x grows large.', 18, recY + 14);
  doc.text('• The vertical line x = 0 is undefined because division by zero is not possible.', 18, recY + 20);

  // Student Reflection
  const reflY = recY + 30;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Learning Reflection', 14, reflY);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, reflY + 3, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  const reflText = reflection.trim() || 'No written reflection provided yet.';
  const splitRefl = doc.splitTextToSize(reflText, 174);
  doc.text(splitRefl, 18, reflY + 9);

  // Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Cambridge Assessment International Education • IGCSE 0580 Mathematics Interactive Portfolio', 14, 288);
  doc.text(`Generated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 175, 288);

  // Download PDF
  const filename = `IGCSE_0580_Curved_Graphs_Report_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Downloads a complete standalone HTML Report that can be viewed and printed offline
 */
export function downloadHtmlReport({
  studentName,
  score,
  answers,
  questions,
  reflection,
}: ExportReportParams) {
  const name = studentName.trim() || 'Student';
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quadScore = questions
    .filter((q) => q.section === 'quadratic')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const hypScore = questions
    .filter((q) => q.section === 'hyperbola')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const totalAttempts = Object.values(answers).reduce((acc, curr) => acc + (curr.attempts || 0), 0);
  const answeredCount = Object.values(answers).filter((a) => a.attempts > 0).length;
  const avgAttempts = answeredCount > 0 ? (totalAttempts / answeredCount).toFixed(1) : '1.0';

  let masteryTitle = 'Needs More Practice';
  let badgeClass = 'background:#ffe4e6;color:#9f1239;border:1px solid #fda4af;';
  if (score >= 13 && parseFloat(avgAttempts) <= 1.6) {
    masteryTitle = 'Hyperbola Master 🏆';
    badgeClass = 'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;';
  } else if (score >= 9) {
    masteryTitle = 'On the Right Track 🚀';
    badgeClass = 'background:#e0e7ff;color:#3730a3;border:1px solid #a5b4fc;';
  }

  const rows = questions
    .map((q) => {
      const ans = answers[q.id];
      const isCorrect = ans?.isCorrect ?? false;
      const attempts = ans?.attempts ?? 0;
      const hints = ans?.revealedHints ?? 0;
      const isHigh = attempts >= 3;

      let concept = 'Quadratic Parabolas';
      if (q.id === 'hyp-6' || q.id === 'hyp-7' || q.id === 'hyp-8') concept = 'Graph to Equation';
      if (q.id === 'hyp-9' || q.id === 'hyp-10' || q.id === 'hyp-11') concept = 'Equation to Graph';
      if (q.id === 'hyp-12' || q.id === 'hyp-13') concept = 'Asymptote (y = b)';
      if (q.id === 'hyp-14' || q.id === 'hyp-15') concept = 'Sign of a & Quadrants';

      return `
      <tr style="${isHigh ? 'background:#fef3c7;' : ''}">
        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e2e8f0;">${q.number}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${q.title}</td>
        <td style="padding:8px 12px;color:#64748b;border-bottom:1px solid #e2e8f0;">${concept}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:${isCorrect ? '#059669' : '#d97706'};">
          ${isCorrect ? '✓ Solved' : attempts > 0 ? 'In Progress' : 'Unanswered'}
        </td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:${isHigh ? 'bold' : 'normal'};color:${isHigh ? '#b45309' : '#1e293b'};">
          ${attempts}${isHigh ? ' *' : ''}
        </td>
        <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #e2e8f0;color:#64748b;">${hints}</td>
      </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IGCSE 0580 Curved Graphs Report - ${name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 4px 0; }
    .badge-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f1f5f9; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .card-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .card-val { font-size: 22px; font-weight: 800; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
    th { background: #334155; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 12px; }
    .refl-box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; font-style: italic; margin-top: 8px; }
    .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; float: right; }
    @media print { .btn-print { display: none; } body { background: white; padding: 0; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <button class="btn-print" onclick="window.print()">Print to PDF</button>
    <div class="header">
      <div style="font-size:11px;font-weight:bold;color:#4f46e5;letter-spacing:1px;text-transform:uppercase;">Cambridge IGCSE Mathematics 0580 • Portfolio Report</div>
      <div class="title">Curved Graphs: Hyperbolas & Quadratics</div>
      <div style="font-size:13px;color:#64748b;margin-top:6px;">
        Student: <strong>${name}</strong> &bull; Date: <strong>${currentDate}</strong> &bull; Syllabus: <strong>Cambridge 0580</strong>
      </div>
    </div>

    <div class="badge-bar">
      <div class="card">
        <div class="card-title">Overall Score</div>
        <div class="card-val">${score} / 15 <span style="font-size:13px;color:#10b981;">(${Math.round((score / 15) * 100)}%)</span></div>
      </div>
      <div class="card">
        <div class="card-title">Section Breakdown</div>
        <div style="font-size:13px;color:#334155;margin-top:4px;">Warm-up: <strong>${quadScore}/5</strong> &bull; Assessment: <strong>${hypScore}/10</strong></div>
      </div>
      <div class="card" style="${badgeClass}">
        <div class="card-title" style="color:inherit;">Mastery Level</div>
        <div style="font-size:16px;font-weight:800;">${masteryTitle}</div>
        <div style="font-size:11px;margin-top:2px;">Avg. Attempts: ${avgAttempts}</div>
      </div>
    </div>

    <h3 style="font-size:15px;margin-bottom:8px;">Itemized Question Log & Attempt Tracking</h3>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Question Title</th>
          <th>Concept</th>
          <th>Status</th>
          <th style="text-align:center;">Attempts</th>
          <th style="text-align:center;">Hints</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <h3 style="font-size:15px;margin-bottom:4px;margin-top:24px;">Student Learning Reflection</h3>
    <div class="refl-box">${reflection.trim() || 'No written reflection entered yet.'}</div>

    <div style="margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;">
      Cambridge Assessment International Education 0580 &bull; Generated digitally
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `IGCSE_0580_Curved_Graphs_Report_${name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports raw progress JSON for backups
 */
export function exportProgressJson(data: unknown, studentName: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const name = (studentName || 'student').trim().replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `IGCSE_0580_Progress_Backup_${name}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
