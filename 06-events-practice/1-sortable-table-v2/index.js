export default class SortableTable {
  subElements = {};
  headerChildren = {};

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.render();
    this.initSubElements();
    this.initArrow();
    this.sort(sorted.id, sorted.order)
    this.addSortingByClick();
  }

  render() {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `<div data-element="productsContainer" class="products-list__container">
  <div class="sortable-table">
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
          this.headerChildren[headerChild.dataset.id] = headerChild;
        }
        this.subElements.header.addEventListener('click', this.addSortingByClick)
      }
    }
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
        return item.template(data.images);
      }
      return `<div class="sortable-table__cell">${data[item.id]}</div>`
    }).join('');
  }

  sort(field = 'name', order = 'asc') {
    if (this.headerChildren[field].dataset.sortable === 'false') {
      throw new Error('column can not be sortable');
    }
    this.headerChildren[field].append(this.arrow);
    this.headerChildren[field].dataset.order = order;
    this.data = this.sortOnClient(field, order);
    this.subElements.body.innerHTML = this.getBody();
  }

  sortOnClient(field, order = 'asc') {
    const direction = {
      'asc': 1,
      'desc': -1
    };
    if (direction[order] !== direction.asc && direction[order] !== direction.desc) {
      order = 'asc'
    }
    const sortFunction = this.headerChildren[field].dataset.sort_type === 'number' ? this.sortNumber : this.sortString;
    const resultArray = [...this.data];
    return resultArray.sort(function (a, b) {
      return direction[order] * sortFunction(a[field], b[field]);
    });
  }

  addSortingByClick = (event) => {
    if (!event) {
      return;
    }
    const direction = {
      asc: 'desc',
      desc: 'asc'
    }

    const sortElement = event.target.closest('[data-id]');
    if (sortElement.dataset.sortable === 'false') {
      return;
    }
    this.sort(sortElement.dataset.id, direction[sortElement.dataset.order])
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
    this.remove();
  }
}
