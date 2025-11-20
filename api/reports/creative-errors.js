/**
 * Creative Error Reporting API
 *
 * Receives creative quality data and generates reports for SSPs
 * to review and fix problematic creatives.
 */

import { getCreativeQualityTracker } from '../../src/utils/creativeQualityTracker.js';

/**
 * POST /api/reports/creative-errors
 *
 * Request body:
 * {
 *   type: 'creative_blocked' | 'periodic_report',
 *   creativeId?: string,
 *   ssp?: string,
 *   report?: SSPErrorReport
 * }
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleReport(req, res);
  } else if (req.method === 'GET') {
    return handleGetReport(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleReport(req, res) {
  try {
    const { type, creativeId, ssp, report, errorRate, totalImpressions, totalErrors, blockReason } = req.body;

    if (type === 'creative_blocked') {
      // Log blocked creative
      console.log(`[SSP Report] Creative ${creativeId} from ${ssp} BLOCKED`);
      console.log(`[SSP Report] Error Rate: ${(errorRate * 100).toFixed(1)}%`);
      console.log(`[SSP Report] Impressions: ${totalImpressions}, Errors: ${totalErrors}`);
      console.log(`[SSP Report] Reason: ${blockReason}`);

      // In production: Send email/webhook to SSP
      // await sendSSPNotification(ssp, {
      //   creativeId,
      //   errorRate,
      //   blockReason
      // });

      return res.status(200).json({
        success: true,
        message: 'Creative block notification received'
      });
    } else if (type === 'periodic_report') {
      // Log periodic report
      console.log(`[SSP Report] Periodic report for ${report.ssp}`);
      console.log(`[SSP Report] Total Creatives: ${report.totalCreatives}`);
      console.log(`[SSP Report] Total Errors: ${report.totalErrors}`);
      console.log(`[SSP Report] Avg Error Rate: ${(report.avgErrorRate * 100).toFixed(1)}%`);

      // In production: Generate PDF report and email to SSP
      // await generateAndSendReport(report);

      return res.status(200).json({
        success: true,
        message: 'Periodic report received'
      });
    } else {
      return res.status(400).json({ error: 'Invalid report type' });
    }
  } catch (error) {
    console.error('[SSP Report] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function handleGetReport(req, res) {
  try {
    const { ssp } = req.query;

    if (!ssp) {
      return res.status(400).json({ error: 'Missing ssp parameter' });
    }

    const tracker = getCreativeQualityTracker();
    const report = tracker.generateSSPReport(ssp);

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
