import fetchJson from './utils/fetch-json.js';
// import {re} from "@babel/core/lib/vendor/import-meta-resolve";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  data = [];

  constructor({
    url = '',
    range = {},
    label = '',
    link = '#',
    formatHeading = (price) => `${price}`
  } = {}) {
    this.url = url;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.update(range.from, range.to);
  }

  async update(from, to) {
    const requestUrl = new URL(this.url, BACKEND_URL);
    requestUrl.searchParams.set('from', from);
    requestUrl.searchParams.set('to', to);
    const response = await fetch(requestUrl.toString());
    const data = await response.json();
    this.setNewData(Object.values(data));
    this.updateElement(this.data);
  }

  setNewData(data = []) {
    this.data = data;
    this.maxValue = Math.max(...data);
    this.scale = this.chartHeight / this.maxValue;
  }

  render() {
    const elementWrapper = document.createElement('div');
    elementWrapper.innerHTML = `<div class="${this.data.length > 0 ? '' : 'column-chart_loading'} dashboard__chart_"${this.label}>
    <div class="column-chart" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        <a href="/sales" class="column-chart__link">View all</a>
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
        ${this.getBody(this.data)}
      </div>
    </div>
  </div>`;
    this.element = elementWrapper.firstElementChild;
  }

  updateElement(data = []) {
    let body = this.element.querySelector('[data-element="body"]');
    let header = this.element.querySelector('[data-element="header"]');
    header.textContent = this.data.reduce((partialSum, a) => partialSum + a, 0)
    body.innerHTML = this.getBodyRows(data);
    this.element.classList.remove('column-chart_loading');
  }

  getBody(data = []) {
    return `<div data-element="body" class="column-chart__chart">
      ${this.getBodyRows(data)}
    </div>`
  }

  getBodyRows(data = []) {
    const rows = [...data];
    const newArray = rows.map((item) => {
      return `<div style="--value:${String(Math.floor(item * this.scale))}" data-tooltip="${(item / this.maxValue * 100).toFixed(0) + '%'}"></div>`
    })
    return newArray.join('');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.chartHeight = null;
  }
}
