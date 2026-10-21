const { chromium } = require('playwright');
const { logger } = require('../utils/logger');

class CTRIScraper {
  constructor() {
    this.baseUrl = process.env.CTRI_BASE_URL || 'https://ctri.nic.in/Clinicaltrials';
    this.searchUrl = process.env.CTRI_SEARCH_URL || 'https://ctri.nic.in/Clinicaltrials/advancesearchmain.php';
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    logger.info('CTRI Scraper initialized');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('CTRI Scraper closed');
    }
  }

  async searchTrials(filters = {}) {
    try {
      await this.init();

      // Navigate to search page
      await this.page.goto(this.searchUrl, { waitUntil: 'networkidle', timeout: 60000 });

      // Fill search form
      if (filters.keyword) {
        await this.page.fill('input[name="keyword"]', filters.keyword);
      }

      if (filters.condition) {
        await this.page.fill('input[name="condition"]', filters.condition);
      }

      if (filters.recruitmentStatus) {
        await this.page.selectOption('select[name="recruitmentStatus"]', filters.recruitmentStatus);
      }

      if (filters.state) {
        await this.page.selectOption('select[name="state"]', filters.state);
      }

      if (filters.phase) {
        await this.page.selectOption('select[name="phase"]', filters.phase);
      }

      // Submit search
      await this.page.click('input[type="submit"]');
      await this.page.waitForLoadState('networkidle');

      // Extract results
      const results = await this.extractSearchResults();
      return results;
    } catch (error) {
      logger.error('CTRI search error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async extractSearchResults() {
    const results = [];

    // Wait for results table
    await this.page.waitForSelector('table', { timeout: 30000 });

    const rows = await this.page.$$('table tr');
    for (let i = 1; i < rows.length; i++) { // Skip header
      const cells = await rows[i].$$('td');
      if (cells.length > 0) {
        const trial = {
          ctriNumber: await cells[0]?.innerText() || '',
          title: await cells[1]?.innerText() || '',
          condition: await cells[2]?.innerText() || '',
          recruitmentStatus: await cells[3]?.innerText() || '',
          phase: await cells[4]?.innerText() || '',
          sourceUrl: this.baseUrl
        };
        results.push(trial);
      }
    }

    return results;
  }

  async getTrialDetails(trialId) {
    try {
      await this.init();

      const url = `${this.baseUrl}/pmaindet2.php?trialid=${trialId}`;
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

      // Extract trial details
      const details = await this.extractTrialDetails();
      return details;
    } catch (error) {
      logger.error('CTRI trial details error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async extractTrialDetails() {
    const details = {};

    // Extract all table data
    const tables = await this.page.$$('table');
    for (const table of tables) {
      const rows = await table.$$('tr');
      for (const row of rows) {
        const cells = await row.$$('td');
        if (cells.length >= 2) {
          const label = await cells[0].innerText();
          const value = await cells[1].innerText();
          details[label.trim()] = value.trim();
        }
      }
    }

    return details;
  }

  async getRecruitingTrials(batchSize = 50, offset = 0) {
    try {
      await this.init();

      // Navigate to advanced search
      await this.page.goto(this.searchUrl, { waitUntil: 'networkidle', timeout: 60000 });

      // Set recruitment status to "Open to Recruitment"
      await this.page.selectOption('select[name="recruitmentStatus"]', 'Open to Recruitment');

      // Submit search
      await this.page.click('input[type="submit"]');
      await this.page.waitForLoadState('networkidle');

      // Extract results
      const results = await this.extractSearchResults();

      // Paginate if needed
      const totalResults = results.length;
      const paginatedResults = results.slice(offset, offset + batchSize);

      return {
        trials: paginatedResults,
        total: totalResults,
        hasMore: offset + batchSize < totalResults
      };
    } catch (error) {
      logger.error('CTRI recruiting trials error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = new CTRIScraper();
