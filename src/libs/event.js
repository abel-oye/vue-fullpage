export const addEventListener = (el, eventName, callback, isUseCapture) => {
    if (el.addEventListener) {
        el.addEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.attachEvent("on" + eventName, callback);
    }
}

export const removeEventListener = (el, eventName, callback, isUseCapture) => {
    if (el.removeEventListener) {
        el.removeEventListener(eventName, callback, !!isUseCapture);
    } else {
        el.detachEvent("on" + eventName, callback);
    }
}

export const triggerEvent = (eventName, value) =>{
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, false, true);
    event.value = value;
    return event
}
