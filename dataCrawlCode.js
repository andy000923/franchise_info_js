const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2');

async function fetchData() {
  const header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
  };

  try {
    const response = await axios.get('https://franchise.ftc.go.kr/mnu/00013/program/userRqst/list.do?searchCondition=&searchKeyword=&column=&selUpjong=&selIndus=&pageUnit=12300&pageIndex=1', {
      headers: header
    });

    const $ = cheerio.load(response.data);
    const notices = $('#frm > table > tbody > tr');

    const items = [];

    notices.each((index, element) => {
      const bun = $(element).find('td:nth-child(1)').text().trim();
      const sang = $(element).find('td:nth-child(2)').text().trim();
      const young = $(element).find('td:nth-child(3)').text().trim();
      const dae = $(element).find('td:nth-child(4)').text().trim();
      const deung = $(element).find('td:nth-child(5)').text().trim();
      const choi = $(element).find('td:nth-child(6)').text().trim();
      const eop = $(element).find('td:nth-child(7)').text().trim();

      items.push([bun, sang, young, dae, deung, choi, eop]);
    });

    return items;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

async function run() {
  const items = await fetchData();

  const connection = mysql.createConnection({
    user: 'root',
    password: 'andy0923',
    host: 'localhost',
    database: 'crawl_data',
    charset: 'utf8'
  });

  connection.connect();

  connection.query('DROP TABLE IF EXISTS franchise_info');
  connection.query('CREATE TABLE franchise_info (번호 VARCHAR(255), 상호 VARCHAR(255), 영업표지 VARCHAR(255), 대표자 VARCHAR(255), 등록번호 VARCHAR(255), 최초등록일 VARCHAR(255), 업종 VARCHAR(255))');

  for (const item of items) {
    connection.query(`INSERT INTO franchise_info VALUES (?, ?, ?, ?, ?, ?, ?)`, item);
  }

  connection.end();
}

run();
