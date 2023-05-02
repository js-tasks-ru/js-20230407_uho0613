import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  subElements = {};
  columns = {};
  currentCountProduct = 0;
  currentSortingField = 'title';
  currentOrder = 'asc';
  countDownload = 10;

  constructor(headersConfig, {
    url = '',
    data = [],
    isSortLocally = false,
    sorted = {
      id: 'title',
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.render();
    this.initSubElements();
    this.initArrow();
    this.sortOnServer(sorted.id, sorted.order);
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table sortable-table_loading">
    ${this.getHeader()}
    ${this.getBody()}

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>

  </div>
</div>`;
    this.element = wrapper.firstElementChild;
  }

  initSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
      if (element.dataset.element === 'header') {
        for (const headerChild of element.children) {
          this.columns[headerChild.dataset.id] = headerChild;
        }
      }
    }
    this.subElements.header.addEventListener('pointerdown', this.sortByClick);
    window.addEventListener('scroll', this.downloadDataByScroll);
  }

  initArrow() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
    this.arrow = wrapper.firstElementChild;
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaderBody()}
    </div>`;
  }

  getHeaderBody() {
    let headerBody = this.headerConfig.map((item) => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sort_type ="${item.sortType}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>`
    });
    return headerBody.join('');
  }

  getBody() {
    return `<div data-element="body" class="sortable-table__body">
       ${this.getRowsForBody()};
</div>`
  }

  getRowsForBody() {
    const rows = [];
    for (const rowData of this.data) {
      rows.push(this.getBodyRow(rowData));
    }
    return rows.join('');
  }

  getBodyRow(data = []) {
    return `<a href="/products/${data.path ? data.path : '#'}" class="sortable-table__row">
             ${this.getCellsForRow(data)}
      </a>`
  }

  getCellsForRow(data = []) {
    return this.headerConfig.map((item) => {
      if (item.hasOwnProperty('template')) {
        return item.template(data[item.id]);
      }
      return `<div class="sortable-table__cell">${data[item.id]}</div>`
    }).join('');
  }

  sortByClick = (event) => {
    const direction = {
      asc: 'desc',
      desc: 'asc'
    }

    const sortElement = event.target.closest('[data-id]');
    if (sortElement.dataset.sortable === 'false') {
      return;
    }
    const {id, order} = sortElement.dataset;
    this.isSortLocally ? this.sortOnClient(id, direction[order]) : this.sortOnServer(id, direction[order]);

  }

  sortOnClient(field = 'title', order = 'asc') {
    const direction = {
      'asc': 1,
      'desc': -1
    };
    if (direction[order] !== direction.asc && direction[order] !== direction.desc) {
      order = 'asc'
    }
    const sortFunction = this.columns[field].dataset.sort_type === 'number' ? this.sortNumber : this.sortString;
    const resultArray = [...this.data];
    this.data = resultArray.sort(function (a, b) {
      return direction[order] * sortFunction(a[field], b[field]);
    });
    this.updateTable(field, order);
  }

  async sortOnServer(id = 'title', order = 'asc', to = 20, from = 0) {
    this.element.classList.add('sortable-table_loading');
    this.currentSortingField = id;
    this.currentCountProduct = to - from;
    this.data = await this.loadData(id, order, from, to);
    this.updateTable(id, order);
    this.element.classList.remove('sortable-table_loading');
  }

  downloadDataByScroll = (event) => {
    const elementParam = this.element.getBoundingClientRect();
    if (elementParam.bottom < document.documentElement.clientHeight + 100) {
      this.sortOnServer(this.currentSortingField, this.currentOrder, this.currentCountProduct + this.countDownload
      );
    }
  }

  getPreparedUrl(sortId, order, from, to) {
    const requestUrl = new URL(this.url, BACKEND_URL);
    requestUrl.searchParams.set('_sort', sortId);
    requestUrl.searchParams.set('_order', order);
    requestUrl.searchParams.set('_start', from);
    requestUrl.searchParams.set('_end', to);
    return requestUrl.toString();
  }

  async loadData(id, order, from, to) {
    return await fetchJson(this.getPreparedUrl(id, order, from, to));
  }

  updateTable(field = 'title', order = 'asc') {
    if (this.columns[field].dataset.sortable === 'false') {
      throw new Error('column can not be sortable');
    }
    this.currentSortingField = field;
    this.currentOrder = order;
    this.columns[field].append(this.arrow);
    this.columns[field].dataset.order = order;
    this.subElements.body.innerHTML = this.getRowsForBody(this.data);
  }

  sortNumber = (a, b) => {
    return a - b;
  };

  sortString = (a, b) => {
    return a.localeCompare(b, ['ru-Ru-u-kf-upper', 'en-US-u-kf-upper']);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this.columns = {};
    this.currentCountProduct = 0;
    this.currentSortingField = 'title';
    this.currentOrder = 'asc';
    this.countDownload = 10;
    this.remove();
  }
}
