export default class RangePicker {
  subElements = [];
  monthQty;
  currentDate;

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
    const monthHtml = [];
    this.currentDate = new Date(this.from);
    this.currentDate.setDate(1);
    for (let i = 0; i < this.monthQty; i++) {
      monthHtml.push(this.getMonth());
    }
    return monthHtml.join('');
  }

  getMonth() {
    const monthName = this.currentDate.toLocaleString('en-us', {month: 'long'});
    return `<div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          ${this.getWeekDays()}
        </div>
        <div class="rangepicker__date-grid">
          ${this.getDaysList()}
        </div>
      </div>`
  }

  getDaysList() {
    const daysArray = [];
    this.currentMonth = this.currentDate.getMonth();
    daysArray.push(`<button type="button" class="rangepicker__cell ${this.getStateOfDay()}" data-value="${this.currentDate.toISOString()}" style="--start-from: ${this.currentDate.getDay()}">${this.currentDate.getDate()}</button>`);
    while (this.currentMonth === this.currentDate.getMonth()) {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      if (this.currentMonth === this.currentDate.getMonth()) {
        daysArray.push(`<button type="button" class="rangepicker__cell ${this.getStateOfDay()}" data-value="${this.currentDate.toISOString()}">${this.currentDate.getDate()}</button>`);
      } else {
        break;
      }
    }
    this.currentMonth = this.currentDate.getMonth();

    return daysArray.join('');
  }

  getWeekDays() {
    const weekDays = [];
    let day = this.getMonday(this.currentDate);
    for (let i = 0; i < 7; i++) {
      weekDays.push(`<div>${day.toLocaleDateString('en-us', {weekday: 'short'})}</div>`)
      day.setDate(day.getDate() + 1);
    }
    return weekDays.join('');
  }

  getMonday(currentDate) {
    const date = new Date(currentDate.getTime());
    const day = date.getDay(),
      diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
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
