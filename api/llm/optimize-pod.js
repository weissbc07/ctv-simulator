/**
 * LLM API Endpoint for Ad Pod Optimization
 *
 * Uses Claude (Anthropic) or OpenAI GPT to generate optimal ad pod strategies
 * based on contextual information, historical performance, and demand source data.
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Main handler for ad pod optimization
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Call Claude API for optimization strategy
    const strategy = await generateOptimizationStrategy(prompt);

    return res.status(200).json({
      success: true,
      strategy
    });
  } catch (error) {
    console.error('LLM optimization error:', error);
    return res.status(500).json({
      error: 'Failed to generate optimization strategy',
      message: error.message
    });
  }
}

/**
 * Generate optimization strategy using Claude
 */
async function generateOptimizationStrategy(prompt) {
  // Check if Anthropic API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('No Anthropic API key found, using fallback strategy');
    return generateFallbackStrategy(prompt);
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract JSON from response
    const responseText = message.content[0].text;

    // Try to parse JSON directly
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/```\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonText);
      }

      throw new Error('Failed to extract JSON from LLM response');
    }
  } catch (error) {
    console.error('Anthropic API error:', error);

    // Fallback to rule-based strategy
    return generateFallbackStrategy(prompt);
  }
}

/**
 * Fallback strategy generator (rule-based)
 * Used when LLM is unavailable or fails
 */
function generateFallbackStrategy(prompt) {
  console.log('Using fallback rule-based strategy');

  // Parse prompt to extract key information
  const positionMatch = prompt.match(/Position: (\w+)/i);
  const videoLengthMatch = prompt.match(/Video length: (\d+)s/i);
  const timeAvailableMatch = prompt.match(/Available ad time: (\d+)s/i);
  const deviceMatch = prompt.match(/Device: (\w+)/i);

  const position = positionMatch ? positionMatch[1].toLowerCase() : 'preroll';
  const videoLength = videoLengthMatch ? parseInt(videoLengthMatch[1]) : 300;
  const timeAvailable = timeAvailableMatch ? parseInt(timeAvailableMatch[1]) : 30;
  const device = deviceMatch ? deviceMatch[1].toLowerCase() : 'desktop';

  // Extract demand sources
  const sourcesSection = prompt.match(/DEMAND SOURCES AVAILABLE:\n([\s\S]*?)(?=\n\n|OPTIMIZE FOR:)/);
  const sources = [];

  if (sourcesSection) {
    const sourceMatches = sourcesSection[1].matchAll(/- ([^:]+):\s*\* Avg CPM: \$(\d+\.?\d*)/g);
    for (const match of sourceMatches) {
      sources.push({
        name: match[1].trim(),
        avgCPM: parseFloat(match[2])
      });
    }
  }

  // Sort sources by CPM
  sources.sort((a, b) => b.avgCPM - a.avgCPM);

  // Determine optimal slot count based on position and time available
  let slotCount = 1;
  let durations = [15];
  let floor = 8.00;

  if (position === 'midroll') {
    floor = 10.00;
    if (timeAvailable >= 60) {
      slotCount = 2;
      durations = [30, 30];
    } else if (timeAvailable >= 30) {
      slotCount = 1;
      durations = [30];
    } else {
      slotCount = 1;
      durations = [15];
    }
  } else if (position === 'preroll') {
    floor = 8.00;
    if (timeAvailable >= 45) {
      slotCount = 2;
      durations = [15, 30];
    } else {
      slotCount = 1;
      durations = timeAvailable >= 30 ? [30] : [15];
    }
  } else if (position === 'postroll') {
    floor = 6.00;
    slotCount = 1;
    durations = [15];
  }

  // CTV gets higher floors
  if (device.includes('tv') || device === 'ctv') {
    floor *= 1.25;
  }

  // Build sequence
  const sequence = [];
  for (let i = 0; i < slotCount; i++) {
    const slotFloor = i === 0 ? floor : floor * 1.15; // Higher floor for second slot
    const topSources = sources.slice(0, 3).map(s => s.name);

    if (topSources.length === 0) {
      topSources.push('Google AdX', 'PubMatic', 'Magnite');
    }

    sequence.push({
      slot: i + 1,
      duration: durations[i],
      sources: topSources,
      floor: Math.round(slotFloor * 100) / 100,
      timeout: 1200 + (i * 300),
      expectedCPM: sources.length > 0 ? sources[0].avgCPM : 10.00,
      fillProbability: 0.80 - (i * 0.10),
      separation: {
        rules: i > 0 ? ['no_competing_brands_from_previous_slot'] : [],
        minimumTimeBetween: 0,
        excludedCategories: []
      }
    });
  }

  // Calculate expected revenue
  const expectedRevenue = sequence.reduce((sum, slot) => {
    return sum + (slot.expectedCPM * slot.fillProbability / 1000);
  }, 0);

  return {
    slotCount,
    durations,
    sequence,
    expectedRevenue: Math.round(expectedRevenue * 1000) / 1000,
    expectedCompletionRate: 0.75,
    reasoning: `Fallback rule-based strategy: ${slotCount} slot(s) for ${position} position with ${timeAvailable}s available time`
  };
}
