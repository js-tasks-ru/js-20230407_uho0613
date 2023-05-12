export default class RangePicker {
  subElements = [];
  monthQty;
  currentDate;
  monthNames = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  constructor({
    monthQty = 2,
    from = new Date(),
    to = new Date()
  } = {}) {
    this.monthQty = monthQty;
    this.from = from;
    this.to = to;
    this.render();
    this.initSubElements();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="rangepicker rangepicker_open">
    <div class="rangepicker__input" data-element="input">
      ${this.getInputs()}
    </div>
    <div class="rangepicker__selector" data-element="selector">
      ${this.getSelector()}
    </div>
  </div>`;
    this.element = wrapper.firstElementChild;
  }

  initSubElements() {
    for (const element of this.element.querySelectorAll('[data-element]')) {
      this.subElements[element.dataset.element] = element;
    }
    this.initAddListeners();
  }

  initAddListeners() {
    this.subElements.selector.addEventListener('pointerdown', this.actionForChoosing);
  }

  actionForChoosing = (event) => {
    const dayButton = event.target.closest('button');
    if (!dayButton) {
      return;
    }
    const chosenDate = new Date(dayButton.dataset.value);
    const fromDiff = Math.abs(this.from.getTime() - chosenDate.getTime());
    const toDiff = Math.abs(this.to.getTime() - chosenDate.getTime());
    if (fromDiff === toDiff) {
      this.from = chosenDate;
    }

    if (fromDiff > toDiff) {
      this.to = chosenDate;
    } else {
      this.from = chosenDate;
    }

    this.subElements.input.innerHTML = this.getInputs();
    this.subElements.selector.innerHTML = this.getSelector();
    this.element.dispatchEvent(new CustomEvent("date-select", {
      bubbles: true,
      detail: {
        from: this.from,
        to: this.to
      }
    }));
  }

  getInputs() {
    return `<span data-element="from">${this.from.toLocaleDateString()}</span> -
      <span data-element="to">${this.to.toLocaleDateString()}</span>`;
  }

  getSelector() {
    return `<div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendars()}`;
  }

  getCalendars() {

    let monthHtml = [];
    this.currentDate = new Date(this.from);
    this.currentDate.setDate(1);
    for (let i = 0; i < this.monthQty; i++) {
      monthHtml.push(this.getMonth());
    }
    return monthHtml.join('');
  }

  getMonth() {
    return `<div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="November">${this.monthNames[this.currentDate.getMonth()]}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.getDaysList()}
        </div>
      </div>`
  }

  getDaysList() {
    let daysArray = [];
    this.currentMonth = this.currentDate.getMonth();
    daysArray.push(`<button type="button" class="rangepicker__cell ${this.getStateOfDay()}" data-value="${this.currentDate.toISOString()}" style="--start-from: ${this.currentDate.getDay()}">1</button>`);
    for (let i = 2; i <= 32; i++) {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      if (this.currentMonth !== this.currentDate.getMonth()) {
        this.currentMonth = this.currentDate.getMonth();
        break;
      }
      daysArray.push(`<button type="button" class="rangepicker__cell ${this.getStateOfDay()}" data-value="${this.currentDate.toISOString()}">${i}</button>`);
    }

    return daysArray.join('');
  }

  getStateOfDay() {
    const fromTime = this.from.getTime();
    const currentTime = this.currentDate.getTime();
    if (fromTime === currentTime) {
      return 'rangepicker__selected-from';
    }
    if (fromTime < currentTime && this.to.getTime() > currentTime) {
      return 'rangepicker__selected-between';
    }

    if (this.to.getTime() === currentTime) {
      return 'rangepicker__selected-to';
    }

    return '';
  }

}
