class Tooltip {

  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip"></div>`;
    this.element = wrapper.firstElementChild;
    this.element.style.position = "absolute";
    document.body.addEventListener('pointerover', (event) => {
      if (event.target.dataset.tooltip) {
        this.actionForOver(event);
      }
    })
  }

  actionForOver = (event) => {
    this.addPositionToElement(event);
    this.render(event.target.dataset.tooltip);
    event.target.addEventListener('pointermove', this.actionForMoving);
    event.target.addEventListener('pointerout', this.actionForOut);
  };

  actionForMoving = (event) => {
    this.addPositionToElement(event);
    this.render(event.target.dataset.tooltip);
  };

  actionForOut = (event) => {
    event.target.removeEventListener('pointermove', this.actionForMoving);
    this.element.remove();
  }

  addPositionToElement = (event) => {
    this.element.style.left = event.pageX + 'px';
    this.element.style.top = event.pageY + 'px';
    this.element.style.background = 'red';
  }

  render(text = 'hello') {
    this.element.textContent = text;
    document.body.append(this.element);
  }

  destroy() {
    this.element.remove()
  }
}

export default Tooltip;
