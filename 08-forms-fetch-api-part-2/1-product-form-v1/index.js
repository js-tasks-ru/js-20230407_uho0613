import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import {sum} from "../../01-intro/1-sum";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  mainPathForData = '/api/rest/';
  categoryPartPath = 'categories';
  productsPartPath = 'products'
  productData = {};
  subElements = [];

  constructor(productId = null) {
    this.productId = productId;
  }

  async render() {
    await this.productDataInit();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="product-form">
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
        <button type="button" name="uploadImage" class="button-primary-outline  fit-content"><span>Загрузить</span></button>
        <input name="imageInput" type="file" accept="image/*" hidden="">
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
            ${await this.getSubcategoryOptions()}
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
  </div>`;
    this.element = wrapper.firstElementChild;
    this.initSubElements();
    this.form.addEventListener('submit', this.saveProductData)
    this.initFormData();
    return this.element;
  }

  async productDataInit() {
    if (this.productId === null) {
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
    this.form.uploadImage.addEventListener('click', (event) => {
      this.form.imageInput.click();
    });
  }

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

  sendImage() {
    this.subElements.productForm.imageInput.addEventListener('change', (event) => {
      this.subElements.productForm.uploadImage.classList.add("is-loading");
      let newForm = new FormData();
      newForm.append('image', event.target.files[0]);
      fetch('https://api.imgur.com/3/image', {
        method: "POST",
        headers: {
          Authorization: "Client-ID " + IMGUR_CLIENT_ID
        },
        body: newForm
      }).then((data) => {
        console.log(data);
      }).catch((error) => {
        console.log(error);
      });
    });
  }

  initSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
    this.form = this.subElements.productForm;
  }

  async getSubcategoryOptions() {
    let subcategory = [];
    const categories = await this.loadCategories();
    for (const category of categories) {
      subcategory = subcategory.concat(
        category.subcategories.map(
          item => `<option value="${item.id}">${category.title + " &gt; " + item.title}</option>`
        )
      );
    }
    return subcategory.join('');
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
    return `<ul class="sortable-list">${this.productData.images.map((image) => {
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
    }).join('')}</ul>`
  }
}
