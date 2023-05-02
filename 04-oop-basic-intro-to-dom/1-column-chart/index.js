export default class ColumnChart {
  chartHeight = 50;
  subElements = [];

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '#',
    formatHeading = (price) => `${price}`
  } = {}) {
    this.setNewData(data)
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.initSubElements();
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

  initSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
  }

  update(data = []) {
    this.setNewData(data);
    this.subElements.body.innerHTML = this.getBody(data);
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
