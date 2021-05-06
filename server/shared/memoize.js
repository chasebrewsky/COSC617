module.exports = {
  /**
   * Method decorator that caches the result of the first method call
   * and replaces the decorated method on the parent object.
   * @param self Reference to this value.
   * @param prop Property name to replace on this.
   * @param func Function to decorate.
   * @returns {function(...[*]): void}
   */
  propcache: (self, prop, func) => {
    return (...args) => {
      const value = func.call(self, ...args);
      self[prop] = () => value;
      return value;
    };
  },
  memget: (obj, props) => {
    for (const prop of props) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      const getter = descriptor.get;

      if (!getter) continue;

      Object.defineProperty(obj, prop, {
        ...descriptor,
        get: () => {
          const value = getter();
          Object.defineProperty(obj, prop, { get: () => value });
          return value;
        },
      });
    }

    return obj;
  },
};
