const mongoose = require('mongoose');
const { MONGO_URL, secret } = require('../config');
const crypto = require('crypto');
const pdfForm = require('../utils/template/pdfForms')
const pdfForm2 = require('../utils/template/pdfForms2')
const PATH = require('path');
const fs = require('fs');


exports.connectDatabase = () => {
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('\x1b[36m%s\x1b[0m', `Database Connected : ${MONGO_URL}`);
    })
    .catch(err => {
      console.error('\x1b[33m%s\x1b[0m', 'Database Connection Error', err);
    });
};

exports.generatePdf = async data => {
const pdf = pdfForm(data)
const filename = `form_${data.student_number}.pdf`;
const path = PATH.resolve(PATH.join(__dirname, '../../', filename));
console.log({path})
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: false,
  timeout: 600000,
});
const page = await browser.newPage();
await page.setContent(pdf, { waitUntil: 'networkidle0' });
const pdfDoc = await page.pdf({
  path: './output.pdf',
  format: 'A4',
  scale: 0.9,
  height: '700px',
  width: '710px',
  // margin: {
  //   right: '1cm',
  //   left: '1cm'
  // },
  printBackground: true,
});
await browser.close();
const buffer = fs.readFileSync('./output.pdf');
//fs.unlinkSync('./output.pdf');
return  buffer;
}
exports.generatePdf2 = async data => {
console.log('inside 2');
const pdf = pdfForm2(data)
const filename = `form_${data.student_number}.pdf`;
const path = PATH.resolve(PATH.join(__dirname, '../../', filename));
console.log({path})
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: false,
  timeout: 600000,
});
const page = await browser.newPage();
await page.setContent(pdf, { waitUntil: 'networkidle0' });
const pdfDoc = await page.pdf({
  path: './output.pdf',
  format: 'A4',
  scale: 0.9,
  height: '700px',
  width: '710px',
  printBackground: true,
});
await browser.close();
const buffer = fs.readFileSync('./output.pdf');
//fs.unlinkSync('./output.pdf');
return  buffer;
}

exports.encryptText = text => {
  console.log({ text });
  const iv = crypto.randomBytes(16);
  let key = crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex');
  return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
};
exports.pagination = (items, page, totalItems, itemsPerPage) => {
  items = items || [];
  page = page || 1;
  totalItems = totalItems || 0;
  itemsPerPage = itemsPerPage || 5;

  return {
      items: items,
      currentPage: page,
      hasNextPage: itemsPerPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / itemsPerPage),
      totalItems: totalItems,
  };
};

/**
 *
 * @param {*} param0
 * @returns
 */
exports.filterQuery = ({ query }) => ({
  ...query,
  page: query.page ? Number(query.page) : 1,
  itemsPerPage: query.itemsPerPage ? Number(query.itemsPerPage) : query.perPage ? Number(query.perPage) : 10,
  searchText: query.searchText !== 'null' && query.searchText !== 'undefined' && query.searchText ? query.searchText : '',
  startDate: query.startDate !== 'null' && query.startDate !== 'undefined' && query.startDate ? query.startDate : '',
  endDate: query.endDate !== 'null' && query.endDate !== 'undefined' && query.endDate ? query.endDate : '',
  filterText: query.filterText !== 'null' && query.filterText !== 'undefined' && query.filterText ? query.filterText : '',
  id: query.id !== 'null' && query.id !== 'undefined' && query.id ? query.id : '',
  status: query.status !== 'null' && query.status !== 'undefined' && query.status ? query.status : '',
});