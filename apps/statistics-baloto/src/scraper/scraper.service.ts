import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { formatearFecha } from '../utils/formatDate';
import { ConfigService } from '@nestjs/config';
import { Result } from 'apps/statistics-baloto/common/interface/result.interface';
import { DataManagerService } from '../data-manager/data-manager.service';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(TasksService.name);
  private baseUrl: string;
  private endpointTraditional: string;
  private endpointRevancha: string;
  private begin: number;
  private end: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataManager: DataManagerService,
  ) {
    this.baseUrl = this.configService.get('BASE_URL');
    this.endpointTraditional = this.configService.get('ENDPOINT_TRADITIONAL');
    this.endpointRevancha = this.configService.get('ENDPOINT_REVANCHA');
    this.begin = this.configService.get('BEGIN');
    this.end = this.configService.get('END');
  }

  async startBrowser(): Promise<Browser> {
    this.logger.debug('Starting browser');
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
      });
      return browser;
    } catch (error) {
      this.logger.error('Error starting browser');
      this.logger.error(error);
      return null;
    }
  }

  async start() {
    this.logger.debug('Starting scraper');
    try {
      const browser = await this.startBrowser();
      if (browser) {
        const lastId = await this.lastIdNumberAvailable(browser);
        console.log(lastId);
        const dataTraditional = await this.iterateScraping(
          browser,
          this.endpointTraditional,
        );
        const dataRevancha = await this.iterateScraping(
          browser,
          this.endpointRevancha,
        );
        this.dataManager.handleData(dataTraditional, dataRevancha);

        await this.closeBrowser(browser);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async iterateScraping(browser: Browser, endpoint: string): Promise<Result[]> {
    this.logger.debug('Iterating scraping');
    const results = [];
    for (let i = 2090; i <= 2095; i++) {
      const url = `${this.baseUrl}${endpoint}${i}`;
      const data = await this.scrapeData(browser, url);
      results.push(data);
    }
    return results;
  }

  async scrapeData(browser: Browser, urlBase: string): Promise<Result> {
    this.logger.debug('Scraping data');

    let numbers = [];
    let page: Page;
    try {
      page = await browser.newPage();
      this.logger.debug(`Navigating to ${urlBase}...`);
      await page.goto(urlBase, { waitUntil: 'load', timeout: 60000 });
      await page.waitForSelector('.bg-baloto-balls');

      numbers = await page.$$eval('div.yellow-ball', (links) => {
        return links.map((link) => link.textContent.trim());
      });
      const balota = await page.$$eval('div.red-ball', (links) => {
        return links.map((link) => link.textContent.trim());
      });

      numbers.push(...balota);

      const date = await page.$$eval('div.gotham-medium.dark-blue', (links) => {
        return links.map((link) => link.textContent.trim());
      });

      const premio = await page.$$eval(
        'div.total-results.dark-blue.gotham-black.text-md-start.text-lg-start.text-center',
        (links) => {
          return links.map((link) => link.textContent.trim());
        },
      );

      await page.close();

      return {
        date: formatearFecha(date[2]),
        results: numbers.slice(0, 5),
        balota: balota[0],
        prize:
          parseInt(premio[0].replaceAll('.', '').replaceAll('$', '')) * 1000000,
      };
    } catch (error) {
      this.logger.error('Error scraping data');
      this.logger.error(error);
      await page.close();
      throw error;
    }
  }

  async lastIdNumberAvailable(browser: Browser) {
    const page = await browser.newPage();
    await page.goto(`${this.baseUrl}/resultados`, {
      waitUntil: 'load',
      timeout: 60000,
    });
    await page.waitForSelector('.carousel-inner');
    const number = await page.$$eval(
      'div.mt-2.text-center.dark-blue.gotham-medium.fs-5 > div:nth-child(2) > strong',
      (links) => {
        return links.map((link) => link.textContent.trim());
      },
    );
    await page.close();
    return Number(number[0].match(/\d{4}/)[0]);
  }

  async closeBrowser(browser: Browser) {
    this.logger.debug('Closing browser');
    try {
      await browser.close();
    } catch (error) {
      this.logger.error('Error closing browser');
      this.logger.error(error);
    }
  }
}
