class JQLite {
    constructor(selector, context) {
        if (typeof selector === 'string') {
            return this.stringMatches(selector, context || document)
        }
    }
    static each(callback) {
        for (let i = 0; i < this.length; i++) {
            callback && callback(this[i], i)
        }
    }
    stringMatches(selector, context) {
        const elements = context.querySelectorAll(selector)
        this.length = elements.length;
        for (let i = 0; i < this.length; i++) {
            this[0] = elements[i]
        }

    }
    get(index = 0) {
        //  return this[index]
    }
    init(selector) {

    }
    css(...args) {
        let styles = args[0]
        if (args.length === 1) {
            if (typeof args[0] === 'string') {
                return window.getComputedStyle(this[0])[args[0]];
            }
        } else if (args.length === 2) {
            styles = {
                [args[0]]: args[1]
            }
        }


    }
    addClass(className) {
        JQLite.each((element) => {
            element.classList.add(className)
        })
    }
    removeClass(className) {
        JQLite.each((element) => {
            element.classList.remove(className)
        })
    }
    hasClass(className) {
        if (this[0]) {
            this[0].classList.contains(className)
        }
        return false
    }
}

export default (selector) => {
    return new JQLite(selector)
}