export default class NotificationMessage {
  static notificationObject = null;
  static counter = 0;

  constructor(message = 'Hello World', {
    duration = 2000,
    type = 'success'
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
    if (NotificationMessage.notificationObject !== null) {
      NotificationMessage.notificationObject.remove();
    }
    NotificationMessage.notificationObject = this;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `  <div class="notification ${this.type}" style="--value:20s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
       ${this.message} " ---- " ${NotificationMessage.counter}
      </div>
    </div>
  </div>`;
    NotificationMessage.counter++;
    this.element = wrapper.firstElementChild;
  }

  show = function (node = document.body) {
    if (NotificationMessage.notificationObject !== null) {
      NotificationMessage.notificationObject.remove();
    }
    NotificationMessage.notificationObject = this;
    node.append(this.element)
    setTimeout(() => {
      this.element.remove();
    }, this.duration);
  }

  remove() {
    NotificationMessage.notificationObject = null;
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
