import puppeteer from 'puppeteer';
import fs from 'fs';

const DATA_DIR = './screenshot-test/data/';
const CLIENT_URL = 'http://localhost:9000/';
const SERVER_URL = 'http://localhost:9095/';

const VIEW_PORT_1080 = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
}
const WAITING_TIME = 2000;
const LONG_WAITING_TIME = 10000;
const LATEST_SNAPSHOTS_DIR = './screenshot-test/__latest_snapshots__/';
const browserConfig = { // Docker requires --no-sandbox to be able to run the tests
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ignoreHTTPSErrors: true,
  dumpio: false
}

// Shared API response data
const apiAccount = fs.readFileSync(`${DATA_DIR}api-account.json`).toString();
const apiV1Info = fs.readFileSync(`${DATA_DIR}api-v1-info.json`).toString();
const numbersLevels = fs.readFileSync(`${DATA_DIR}private-utils-numbers-levels.json`).toString();
const numbersMain = fs.readFileSync(`${DATA_DIR}private-utils-numbers-main.json`).toString();
const geneList = fs.readFileSync(`${DATA_DIR}utils-cancerGeneList.json`).toString();
const allCuratedGenes = fs.readFileSync(`${DATA_DIR}utils-allCuratedGenes.json`).toString();
const evidenceLevels = fs.readFileSync(`${DATA_DIR}private-utils-evidences-levels.json`).toString();
const tumorTypes = fs.readFileSync(`${DATA_DIR}private-utils-tumorTypes.json`).toString();
const userSize = fs.readFileSync(`${DATA_DIR}api-users-size.json`).toString();
const userDetails = fs.readFileSync(`${DATA_DIR}api-users-details.json`).toString();
const companyUserDetails = fs.readFileSync(`${DATA_DIR}api-company-user-details.json`).toString();
const companies = fs.readFileSync(`${DATA_DIR}api-companies.json`).toString();
const companyDetails = fs.readFileSync(`${DATA_DIR}api-company-details.json`).toString();
const usageUsersOverview = fs.readFileSync(`${DATA_DIR}api-usage-summary-users.json`).toString();
const usageResourcesOverview = fs.readFileSync(`${DATA_DIR}api-usage-summary-resources.json`).toString();
const usageUserDetail = fs.readFileSync(`${DATA_DIR}api-usage-users-2021.json`).toString();
const usageResourceDetail = fs.readFileSync(`${DATA_DIR}api-usage-resources-example.json`).toString();

// # Fix the time to expiration date.
function updateTokenExpirationDate(current){
  let today = new Date()
  today.setDate(today.getDate()+100);
  current.forEach(token => {
    token.expiration = today.toISOString();
  })
  return current;
}
let apiAccountToken = fs.readFileSync(`${DATA_DIR}api-account-token.json`).toString();
apiAccountToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(apiAccountToken)));
let userToken = fs.readFileSync(`${DATA_DIR}api-users-tokens.json`).toString();
userToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(userToken)));
let companyUserToken = fs.readFileSync(`${DATA_DIR}api-company-user-tokens.json`).toString();
companyUserToken = JSON.stringify(updateTokenExpirationDate(JSON.parse(companyUserToken)));


function getScreenshotConfig(name){
  return{
    path: `${LATEST_SNAPSHOTS_DIR}${name}-snap.png`,
    fullPage: true
  }
}

if (!fs.existsSync(LATEST_SNAPSHOTS_DIR)){
  fs.mkdirSync(LATEST_SNAPSHOTS_DIR);
}

function getMockResponse(url){
  let res = undefined
  switch (url) {
    case `${SERVER_URL}api/account`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apiAccount
      };
      break;
    case `${SERVER_URL}api/account/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: apiAccountToken
      };
      break;
    case `${SERVER_URL}api/v1/info`:
      res =  {
          status: 200,
          contentType: 'application/json',
          body: apiV1Info
      };
      break;
    case `${SERVER_URL}api/private/utils/numbers/main/`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: numbersMain
      };
      break;
    case `${SERVER_URL}api/private/utils/numbers/levels/`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: numbersLevels
      };
      break;
    case `${SERVER_URL}api/v1/utils/cancerGeneList`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: geneList
      };
      break;
    case `${SERVER_URL}api/v1/utils/allCuratedGenes`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: allCuratedGenes
      };
      break;
    case `${SERVER_URL}api/private/utils/evidences/levels`:
      res =  {
        status: 200,
        contentType: 'application/json',
        body: evidenceLevels
      };
      break;
    case `${SERVER_URL}api/private/utils/tumorTypes`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: tumorTypes
      };
      break;
    case `${SERVER_URL}api/v1/genes/lookup`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `${SERVER_URL}api/users?size=10000`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: userSize
      };
      break;
    case `${SERVER_URL}api/users/admin`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: userDetails
      };
      break;
    case `${SERVER_URL}api/users/user`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: companyUserDetails
      };
      break;
    case `${SERVER_URL}api/users/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `${SERVER_URL}api/companies`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: companies
      }
      break;
    case `${SERVER_URL}api/companies/1`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: companyDetails
      }
      break;
    case `${SERVER_URL}api/users/non-company-emails`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      }
      break;
    case `${SERVER_URL}api/companies/1/users`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      }
      break;
    case `${SERVER_URL}api/users/admin/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: userToken
      };
      break;
    case `${SERVER_URL}api/users/user/tokens`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: companyUserToken
      };
      break;
    case `${SERVER_URL}api/usage/summary/users`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: usageUsersOverview
      };
      break;
    case `${SERVER_URL}api/usage/summary/resources`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: usageResourcesOverview
      };
      break;
    case `${SERVER_URL}api/usage/users/2021`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: usageUserDetail
      };
      break;
    case `${SERVER_URL}api/usage/resources?endpoint=%2Fapi%2Fv1%2Fexample`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: usageResourceDetail
      };
      break;
    case `${SERVER_URL}api/private/search/variants/biological?hugoSymbol=`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    case `${SERVER_URL}api/private/utils/fdaAlterations?hugoSymbol=`:
      res = {
        status: 200,
        contentType: 'application/json',
        body: '[]'
      };
      break;
    default:
      res = undefined
  }
  return res;
}

describe('Tests with login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled!
    page.on('request', (request) => {
      let url = request.url()
      if (getMockResponse(url) !== undefined){
        request.respond(
          getMockResponse(url)
        )
      }
      else request.continue();
    });
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('disablebanner', 'true');
      localStorage.setItem('oncokb-user-token', 'oncokb-public-demo-admin-token');
    });
  })

  it.skip('Home Page', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page with Login' });
  })

  it.skip('Home Page #levelType=Dx', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Dx`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page DX with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page DX with Login' });
  })

  it.skip('Home Page #levelType=Px', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Px`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page PX with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page PX with Login' });
  })

  it.skip('Levels of Evidence Page', async() => {
    await page.goto(`${CLIENT_URL}levels`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page with Login' });
  })

  it.skip ('Levels of Evidence Page #version=DX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=DX`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page DX with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page DX with Login' });
  })

  it.skip ('Levels of Evidence Page #version=PX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=PX`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page PX with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page PX with Login' });
  })

  it.skip ('Levels of Evidence Page #version=AAC', async() => {
    await page.goto(`${CLIENT_URL}levels#version=AAC`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page AAC with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page AAC with Login' });
  })

  it.skip ('Levels of Evidence Page #version=V1', async() => {
    await page.goto(`${CLIENT_URL}levels#version=V1`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page V1 with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page V1 with Login' });
  })

  it.skip('Actionable Genes Page', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Actionable Genes Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page with Login' });
  })

  it.skip('Actionable Genes Page #levels=1,Dx1,Px1', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes#levels=1,Dx1,Px1`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Actionable Genes Page Levels Selected with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page Levels Selected with Login' });
  })

  it.skip('Cancer Genes Page', async() => {
    await page.goto(`${CLIENT_URL}cancerGenes`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Cancer Genes Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Cancer Genes Page with Login' });
  })

  it.skip('About Page', async() => {
    await page.goto(`${CLIENT_URL}about`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('About Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'About Page with Login' });
  })

  it.skip('Team Page', async() => {
    await page.goto(`${CLIENT_URL}team`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Team Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Team Page with Login' });
  })

  it.skip('Terms Page', async() => {
    await page.goto(`${CLIENT_URL}terms`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Terms Page with Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Terms Page with Login' });
  })

  it('Account Settings Page', async() =>{
    await page.goto(`${CLIENT_URL}account/settings`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Account Settings Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Account Settings Page' });
  })

  it('Users Infomation Page', async() =>{
    await page.goto(`${CLIENT_URL}admin/user-details`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Users Infomation Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Users Infomation Page' });
  })

  it('User Details Page', async() =>{
    await page.goto(`${CLIENT_URL}users/admin`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('User Details Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'User Details Page' });
  })

  it('Company User Details Page', async() =>{
    await page.goto(`${CLIENT_URL}users/user`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Company User Details Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Company User Details Page' });
  })

  it('Companies Information Page', async() =>{
    await page.goto(`${CLIENT_URL}admin/company-details`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Companies Information Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Companies Information Page' });
  })

  it('Company Details Page', async() =>{
    await page.goto(`${CLIENT_URL}companies/1`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Company Details Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Company Details Page' });
  })

  it('Usage Analysis Page#User Overview', async()=>{
    await page.goto(`${CLIENT_URL}admin/usage-analysis`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Usage Analysis Page#User Overview'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Usage Analysis Page#User Overview' });
  })

  it('Usage Analysis Page#User Detail', async()=>{
    await page.goto(`${CLIENT_URL}admin/usage-analysis/users/2021`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Usage Analysis Page#User Detail'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Usage Analysis Page#User Detail' });
  })

  it('Usage Analysis Page#Resource Detail', async()=>{
    await page.goto(`${CLIENT_URL}admin/usage-analysis/resources/!api!v1!example`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Usage Analysis Page#Resource Detail'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Usage Analysis Page#Resource Detail' });
  })

  it('Usage Analysis Page#Resource Overview', async()=>{
    await page.goto(`${CLIENT_URL}admin/usage-analysis#type=RESOURCE`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Usage Analysis Page#Resource Overview'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Usage Analysis Page#Resource Overview' });
  })

  afterAll(async () => {
    await browser.close();
  })
})

describe('Tests without login', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(browserConfig);
    page = await browser.newPage();
    await page.setRequestInterception(true); // Handle UnhandledPromiseRejectionWarning: Error: Request Interception is not enabled!
    page.on('request', (request) => {
      let url = request.url()
      if (url.includes('recaptcha')){
        request.abort();
      }
      else{
        if (getMockResponse(url) !== undefined){
          request.respond(
            getMockResponse(url)
          )
        }
        else request.continue();
      }
    });
    await page.goto(`${CLIENT_URL}`);
    await page.evaluate(() => {
      localStorage.setItem('localdev', 'true');
      localStorage.setItem('disablebanner', 'true');
    });
  })

  it('Home Page', async() => {
    await page.goto(`${CLIENT_URL}`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page without Login' });
  })

  it('Home Page #levelType=Dx', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Dx`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page DX without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page DX without Login' });
  })

  it('Home Page #levelType=Px', async() => {
    await page.goto(`${CLIENT_URL}#levelType=Px`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Home Page PX without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Home Page PX without Login' });
  })

  it ('Levels of Evidence Page', async() => {
    await page.goto(`${CLIENT_URL}levels`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page without Login' });
  })

  it ('Levels of Evidence Page #version=DX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=DX`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page DX without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page DX without Login' });
  })

  it ('Levels of Evidence Page #version=PX', async() => {
    await page.goto(`${CLIENT_URL}levels#version=PX`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page PX without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page PX without Login' });
  })

  it ('Levels of Evidence Page #version=AAC', async() => {
    await page.goto(`${CLIENT_URL}levels#version=AAC`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page AAC without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page AAC without Login' });
  })

  it ('Levels of Evidence Page #version=V1', async() => {
    await page.goto(`${CLIENT_URL}levels#version=V1`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('LoE Page V1 without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'LoE Page V1 without Login' });
  })

  it('Actionable Genes Page', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Actionable Genes Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page without Login' });
  })

  it('Actionable Genes Page #levels=1,Dx1,Px1', async() => {
    await page.goto(`${CLIENT_URL}actionableGenes#levels=1,Dx1,Px1`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Actionable Genes Page Levels Selected without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Actionable Genes Page Levels Selected without Login' });
  })

  it('Cancer Genes Page', async() => {
    await page.goto(`${CLIENT_URL}cancerGenes`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Cancer Genes Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Cancer Genes Page without Login' });
  })

  it('About Page', async() => {
    await page.goto(`${CLIENT_URL}about`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(LONG_WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('About Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'About Page without Login' });
  })

  it('Team Page', async() => {
    await page.goto(`${CLIENT_URL}team`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Team Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Team Page without Login' });
  })

  it('Terms Page', async() => {
    await page.goto(`${CLIENT_URL}terms`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Terms Page without Login'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Terms Page without Login' });
  })

  it('Login Page', async() => {
    await page.goto(`${CLIENT_URL}login`);
    await page.setViewport(VIEW_PORT_1080);
    await page.waitFor(WAITING_TIME);
    let image = await page.screenshot(getScreenshotConfig('Login Page'));
    expect(image).toMatchImageSnapshot({ customSnapshotIdentifier: 'Login Page' });
  })

  afterAll(async () => {
    await browser.close();
  })
})

