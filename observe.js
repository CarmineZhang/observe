/**
 * 双向绑定
 */

const OP = Object.prototype
const AP = Array.prototype

const OAM = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

class Observer {
    constructor(obj, callback) {
        if (OP.toString.call(obj) !== '[object Object]') {
            console.error('This parameter must be an object' + obj)
        }
        this.$callback = callback
        this.observe(obj)
    }
    observe(obj, path) {
        if (OP.toString.call(obj) === '[object Array]') {
            this.observeArray(obj, path)
        }
        var self = this
        Object.keys(obj).forEach((key) => {
            let oldVal = obj[key]
            let pathArray = path && path.slice(0)
            if (pathArray) {
                pathArray.push(key)
            } else {
                pathArray = [key]
            }
            Object.defineProperty(obj, key, {
                get() {
                    return oldVal
                },
                set(newVal) {
                    if (oldVal !== newVal) {
                        if (OP.toString.call(newVal) === '[object Object]' || OP.toString.call(newVal) === '[object Array]') {
                            self.observe(newVal, pathArray)
                        }
                        self.$callback(newVal, oldVal, pathArray)
                        oldVal = newVal
                    }
                }
            })
            var val = obj[key]
            if (OP.toString.call(val) === '[object Object]' || OP.toString.call(val) === '[object Array]') {
                this.observe(val, pathArray)
            }
        }, this)
    }
    /*
     * 重新绑定数组方法
     */
    observeArray(array, path) {
        var newProp = Object.create(AP)
        var result,
            self = this
        Object.keys(OAM).forEach((key) => {
            let method = OAM[key]
            let oldVal = []
            Object.defineProperty(newProp, method, {
                configurable: true,
                enumerable: false,
                writeable: true,
                value: function() {
                    var args = AP.slice.apply(arguments)
                    oldVal = this.slice(0)
                    result = AP[method].apply(this, args)
                    self.observe(this, path)
                    self.$callback(this, oldVal, path)
                    return result
                }
            })
        })
        array.__proto__ = newProp
    }
}
