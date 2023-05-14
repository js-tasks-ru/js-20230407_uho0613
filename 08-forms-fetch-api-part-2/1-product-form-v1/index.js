import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import {sum} from "../../01-intro/1-sum";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const IMGUR_API_URL = 'https://api.imgur.com/3/image';

export default class ProductForm {

  mainPathForData = '/api/rest/';
  categoryPartPath = 'categories';
  productsPartPath = 'products'
  productData = {
    images: []
  };
  subElements = [];

  constructor(productId = '') {
    this.productId = productId;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.initSubElements();
    this.initListeners();
    await Promise.all([this.addSubCategories(), this.productDataInit()]);
    this.initFormData();
    return this.element;
  }

  initListeners() {
    this.form.addEventListener('submit', this.saveProductData)
    this.form.uploadImage.addEventListener('click', (event) => {
      this.form.imageInput.click();
    });
    this.form.imageInput.addEventListener('change', this.sendImage)
  }

  async productDataInit() {
    if (!this.productId) {
      return;
    }
    const url = new URL(this.mainPathForData + this.productsPartPath, BACKEND_URL);
    url.searchParams.set('id', this.productId);
    const products = await fetchJson(url.toString());
    this.productData = products[0];
  }

  saveProductData = async (event) => {
    event.preventDefault();
    const url = new URL(this.mainPathForData + this.productsPartPath, BACKEND_URL);
    url.searchParams.set('id', this.productId);
    this.productData = await fetchJson(url.toString(), {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(this.getFormData())
    });
    const eventName = this.productId ? "product-updated" : "product-saved";
    const customEvent = new CustomEvent(eventName, {
      detail: this.productId
    });
    this.productId = this.productData.id;
    this.initFormData();
    this.element.dispatchEvent(customEvent)
  }

  async addSubCategories() {
    this.form.subcategory;
    const categoryList = await this.loadCategories();
    for (const category of categoryList) {
      for (const subCategory of category.subcategories) {
        this.form.subcategory.add(new Option(category.title + " > " + subCategory.title, subCategory.id));
      }
    }
  }

  initFormData() {
    if (!this.productData.price) {
      return;
    }
    this.subElements.imageListContainer.insertAdjacentHTML('afterbegin', this.getImageList());
    this.form.product_id.value = this.productData.id ?? '';
    this.form.price.value = this.productData.price;
    this.form.discount.value = this.productData.discount;
    this.form.quantity.value = this.productData.quantity;
    this.form.title.value = escapeHtml(this.productData.title);
    this.form.description.value = escapeHtml(this.productData.description);
    this.form.status.value = this.productData.status;
    this.form.subcategory.value = escapeHtml(this.productData.subcategory);
  }

  sendImage = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];

    try {
      formData.append('image', file);
      let result = await fetch(IMGUR_API_URL, {
        method: "POST",
        headers: {
          Authorization: "Client-ID " + IMGUR_CLIENT_ID
        },
        body: formData
      });
      this.addImageRow({url: result.link, source: file.name});
    } catch (err) {
      console.log(err);
    }
  };

  getFormData() {
    return {
      id: this.form.product_id.value,
      title: escapeHtml(this.form.title.value),
      description: escapeHtml(this.form.description.value),
      subcategory: this.form.subcategory.value,
      price: parseInt(this.form.price.value, 10),
      quantity: parseInt(this.form.quantity.value, 10),
      discount: parseInt(this.form.discount.value, 10),
      status: parseInt(this.form.status.value, 10),
      images: this.getImagesData()
    }
  }

  getImagesData() {
    return this.productData.images;
  }

  getTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid" name="productForm">
      <input name="product_id" hidden>
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        <ul class="sortable-list"></ul>
        <button type="button" name="uploadImage" class="button-primary-outline  fit-content"><span>Загрузить</span></button>
        <input name="imageInput" type="file" accept="image/*" hidden="">
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="0">Неактивен</option>
          <option value="1">Активен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`
  }

  initSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
    this.form = this.subElements.productForm;
    this.imageList = this.subElements.imageListContainer.querySelector('.sortable-list');
  }

  async loadCategories() {
    const url = new URL(this.mainPathForData + this.categoryPartPath, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    this.data = await fetchJson(url.toString());

    return this.data;
  }

  getImageList() {
    if (!this.productData.images) {
      return '';
    }
    return this.productData.images.map((image) => {
      return this.getImageRow(image);
    }).join('');
  }

  getImageRow(image) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
                <input type="hidden" name="url" value="${image.url}">
                <input type="hidden" name="source" value="${image.source}">
                 <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
                    <span>${image.source}</span>
                </span>
                <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
            </li>`;
  }

  addImageRow(image) {
    this.imageList.insertAdjacentHTML('beforeend', this.getImageRow(image));
    this.productData.images.push(image);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.productData = {};
    this.subElements = [];
  }
}
